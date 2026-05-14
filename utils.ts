import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, MapPin, Pencil, Trash2, Navigation, SprayCan } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import type { FieldWithCustomer, Customer, Field } from "@shared/schema";
import { fmtAcres, fmtDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";
import { FieldForm } from "@/components/FieldForm";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] ?? STATUS_COLORS.pending
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function mapsHref(f: FieldWithCustomer): string | null {
  if (f.latitude != null && f.longitude != null) {
    return `https://maps.google.com/?q=${f.latitude},${f.longitude}`;
  }
  if (f.location) return `https://maps.google.com/?q=${encodeURIComponent(f.location)}`;
  return null;
}

export default function Fields() {
  const fieldsQ = useQuery<FieldWithCustomer[]>({ queryKey: ["/api/fields"] });
  const customersQ = useQuery<Customer[]>({ queryKey: ["/api/customers"] });
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [openNew, setOpenNew] = useState(false);
  const [editField, setEditField] = useState<Field | null>(null);

  const del = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/fields/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      toast({ title: "Field removed" });
    },
  });

  const quickStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/fields/${id}`, {
        status,
        sprayedDate: status === "sprayed" ? new Date().toISOString().slice(0, 10) : undefined,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/fields"] }),
  });

  const filtered = useMemo(() => {
    const list = fieldsQ.data ?? [];
    return list.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (customerFilter !== "all" && String(f.customerId) !== customerFilter) return false;
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        (f.customerName ?? "").toLowerCase().includes(q) ||
        (f.product ?? "").toLowerCase().includes(q) ||
        (f.location ?? "").toLowerCase().includes(q) ||
        (f.cropType ?? "").toLowerCase().includes(q)
      );
    });
  }, [fieldsQ.data, search, statusFilter, customerFilter]);

  const hasCustomers = (customersQ.data ?? []).length > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Fields</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every field, what to spray, where, and at what rate.
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-field" disabled={!hasCustomers} size="sm">
              <Plus className="h-4 w-4 mr-1" /> New field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add field</DialogTitle></DialogHeader>
            <FieldForm
              onSuccess={() => setOpenNew(false)}
              onCancel={() => setOpenNew(false)}
            />
          </DialogContent>
        </Dialog>
      </header>

      {!hasCustomers && !customersQ.isLoading && (
        <Card className="border-card-border bg-accent/30">
          <CardContent className="px-5 py-4 text-sm">
            Add a <Link href="/employee/customers" className="font-medium text-primary underline-offset-2 hover:underline">customer</Link> before creating fields.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          data-testid="input-field-search"
          placeholder="Search field, customer, product, crop…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={customerFilter} onValueChange={setCustomerFilter}>
          <SelectTrigger data-testid="select-customer-filter" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" data-testid="option-customer-all">All customers</SelectItem>
            {(customersQ.data ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)} data-testid={`option-customer-filter-${c.id}`}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList data-testid="tabs-status-filter">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
            <TabsTrigger value="scheduled" data-testid="tab-scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="sprayed" data-testid="tab-sprayed">Sprayed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {fieldsQ.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-md" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-card-border">
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground" data-testid="empty-fields">
            {(fieldsQ.data ?? []).length === 0
              ? "No fields yet. Add a field with the customer, location, product, and rate."
              : "No fields match those filters."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => {
            const href = mapsHref(f);
            return (
              <Card key={f.id} data-testid={`card-field-${f.id}`} className="border-card-border">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="text-base font-semibold leading-tight" data-testid={`text-field-name-${f.id}`}>
                          {f.name}
                        </h3>
                        <StatusBadge status={f.status} />
                        {f.cropType && (
                          <span className="text-xs text-muted-foreground">· {f.cropType}</span>
                        )}
                      </div>
                      <Link
                        href={`/employee/customers/${f.customerId}`}
                        data-testid={`link-customer-${f.id}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {f.customerName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        data-testid={`button-edit-field-${f.id}`}
                        aria-label="Edit field"
                        onClick={() => setEditField(f as Field)}
                        className="hover-elevate rounded p-2 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        data-testid={`button-delete-field-${f.id}`}
                        aria-label="Delete field"
                        onClick={() => {
                          if (confirm(`Delete field "${f.name}"?`)) del.mutate(f.id);
                        }}
                        className="hover-elevate rounded p-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Product</div>
                      <div className="font-medium" data-testid={`text-product-${f.id}`}>{f.product ?? "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Rate</div>
                      <div className="font-medium tabular-nums" data-testid={`text-rate-${f.id}`}>{f.rate ?? "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">Acres</div>
                      <div className="font-medium tabular-nums" data-testid={`text-acres-${f.id}`}>{fmtAcres(f.acres)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        {f.status === "sprayed" ? "Sprayed" : "Scheduled"}
                      </div>
                      <div className="font-medium tabular-nums" data-testid={`text-date-${f.id}`}>
                        {fmtDate(f.status === "sprayed" ? f.sprayedDate : f.scheduledDate)}
                      </div>
                    </div>
                  </div>

                  {(f.location || href || f.notes) && (
                    <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
                      {f.location && (
                        <div className="flex items-start gap-2 text-muted-foreground" data-testid={`text-location-${f.id}`}>
                          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span className="break-words">{f.location}</span>
                        </div>
                      )}
                      {f.notes && (
                        <div className="text-muted-foreground" data-testid={`text-notes-${f.id}`}>
                          {f.notes}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-testid={`link-directions-${f.id}`}
                        className="hover-elevate inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Directions
                      </a>
                    )}
                    {f.status !== "sprayed" && (
                      <button
                        data-testid={`button-mark-sprayed-${f.id}`}
                        onClick={() => quickStatus.mutate({ id: f.id, status: "sprayed" })}
                        className="hover-elevate inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                      >
                        <SprayCan className="h-3.5 w-3.5" /> Mark sprayed
                      </button>
                    )}
                    {f.status === "pending" && (
                      <button
                        data-testid={`button-mark-scheduled-${f.id}`}
                        onClick={() => quickStatus.mutate({ id: f.id, status: "scheduled" })}
                        className="hover-elevate inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium"
                      >
                        Mark scheduled
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={editField !== null} onOpenChange={(o) => !o && setEditField(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit field</DialogTitle></DialogHeader>
          {editField && (
            <FieldForm
              field={editField}
              onSuccess={() => setEditField(null)}
              onCancel={() => setEditField(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
