import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, Search, Layers } from "lucide-react";

// Fix default marker icons (Leaflet's defaults reference broken paths in bundlers)
const markerIcon = L.divIcon({
  className: "field-pin-marker",
  html: `<div style="
    width: 28px; height: 28px;
    background: hsl(103 56% 31%);
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 6px rgba(0,0,0,0.4);
  "><div style="
    position: absolute; top: 7px; left: 7px;
    width: 8px; height: 8px;
    background: white; border-radius: 50%;
  "></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

type Props = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onChange: (lat: number | null, lng: number | null) => void;
  /** Optional default center if no pin yet. Defaults to Madison County, IL. */
  defaultCenter?: [number, number];
  /** Address text to bias search around */
  addressHint?: string;
  height?: number;
  testIdPrefix?: string;
};

// Madison County, IL approximate center
const DEFAULT_CENTER: [number, number] = [38.811, -89.953];

export function FieldMapPicker({
  latitude,
  longitude,
  onChange,
  defaultCenter = DEFAULT_CENTER,
  addressHint,
  height = 340,
  testIdPrefix = "field-map",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satLayerRef = useRef<L.TileLayer | null>(null);
  const [layer, setLayer] = useState<"satellite" | "street">("satellite");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initialCenter: [number, number] =
      latitude != null && longitude != null ? [latitude, longitude] : defaultCenter;
    const initialZoom = latitude != null && longitude != null ? 16 : 12;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
    });
    mapRef.current = map;

    // Esri World Imagery (free, no key) — best for spotting field boundaries
    satLayerRef.current = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution: "Tiles © Esri",
      }
    );
    streetLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    });
    satLayerRef.current.addTo(map);

    // Existing pin
    if (latitude != null && longitude != null) {
      markerRef.current = L.marker([latitude, longitude], {
        icon: markerIcon,
        draggable: true,
      }).addTo(map);
      markerRef.current.on("dragend", (e) => {
        const ll = (e.target as L.Marker).getLatLng();
        onChange(Number(ll.lat.toFixed(6)), Number(ll.lng.toFixed(6)));
      });
    }

    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      placeMarker(lat, lng);
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
    });

    // Invalidate size after mount so map fills container correctly when in a dialog
    setTimeout(() => map.invalidateSize(), 50);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync incoming lat/lng changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (latitude != null && longitude != null) {
      placeMarker(latitude, longitude, false);
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  function placeMarker(lat: number, lng: number, pan = true) {
    if (!mapRef.current) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon: markerIcon,
        draggable: true,
      }).addTo(mapRef.current);
      markerRef.current.on("dragend", (e) => {
        const ll = (e.target as L.Marker).getLatLng();
        onChange(Number(ll.lat.toFixed(6)), Number(ll.lng.toFixed(6)));
      });
    }
    if (pan) mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 16));
  }

  function toggleLayer() {
    if (!mapRef.current || !satLayerRef.current || !streetLayerRef.current) return;
    if (layer === "satellite") {
      satLayerRef.current.remove();
      streetLayerRef.current.addTo(mapRef.current);
      setLayer("street");
    } else {
      streetLayerRef.current.remove();
      satLayerRef.current.addTo(mapRef.current);
      setLayer("satellite");
    }
  }

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const q = search.trim() || addressHint?.trim() || "";
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (mapRef.current) mapRef.current.setView([lat, lng], 16);
      } else {
        setSearchError("Couldn't find that location.");
      }
    } catch {
      setSearchError("Search failed. Check your connection.");
    } finally {
      setSearching(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setSearchError("Your device doesn't share location.");
      return;
    }
    setLocating(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        placeMarker(lat, lng);
        onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
        setLocating(false);
      },
      (err) => {
        setSearchError(err.message || "Could not get your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function clearPin() {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onChange(null, null);
  }

  return (
    <div className="space-y-2">
      <form onSubmit={doSearch} className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            data-testid={`${testIdPrefix}-search`}
            placeholder="Search address or place to jump to…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <button
          type="submit"
          data-testid={`${testIdPrefix}-search-btn`}
          disabled={searching}
          className="hover-elevate inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium"
        >
          {searching ? "Searching…" : "Go"}
        </button>
        <button
          type="button"
          data-testid={`${testIdPrefix}-locate`}
          onClick={useMyLocation}
          disabled={locating}
          className="hover-elevate inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium"
        >
          <Crosshair className="h-3.5 w-3.5" /> {locating ? "Locating…" : "Use my location"}
        </button>
        <button
          type="button"
          data-testid={`${testIdPrefix}-layer`}
          onClick={toggleLayer}
          className="hover-elevate inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium"
        >
          <Layers className="h-3.5 w-3.5" /> {layer === "satellite" ? "Satellite" : "Street"}
        </button>
      </form>
      {searchError && (
        <p className="text-xs text-destructive" data-testid={`${testIdPrefix}-error`}>{searchError}</p>
      )}
      <div
        ref={containerRef}
        data-testid={`${testIdPrefix}-canvas`}
        style={{ height }}
        className="w-full overflow-hidden rounded-md border border-border bg-muted"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <div data-testid={`${testIdPrefix}-coords`}>
          {latitude != null && longitude != null ? (
            <>
              <MapPin className="inline h-3.5 w-3.5 -mt-0.5 mr-1 text-primary" />
              <span className="tabular-nums">{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
              <span className="ml-2">· tap the map or drag the pin to move it</span>
            </>
          ) : (
            <span>Tap the map to drop a pin on the field.</span>
          )}
        </div>
        {latitude != null && longitude != null && (
          <button
            type="button"
            data-testid={`${testIdPrefix}-clear`}
            onClick={clearPin}
            className="hover-elevate rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:text-destructive"
          >
            Clear pin
          </button>
        )}
      </div>
    </div>
  );
}
