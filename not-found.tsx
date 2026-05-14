import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  insertFieldSchema, type Customer, type Field, type InsertField,
} from "@shared/schema";
import { FieldMapPicker } from "./FieldMapPicker";

type FormValues = {
  customerId: number | undefined;
  name: string;
  location: string;
  latitude: string;
  longitude: string;
  acres: string;
  cropType: string;
  product: string;
  rate: string;
  status: string;
  scheduledDate: string;
  sprayedDate: string;
  notes: string;
};

function fieldToForm(f?: Field | null, fixedCustomerId?: number): FormValues {
  return {
    customerId: f?.customerId ?? fixedCustomerId,
    name: f?.name ?? "",
    location: f?.location ?? "",
    latitude: f?.latitude != null ? String(f.latitude) : "",
    longitude: f?.longitude != null ? String(f.longitude) : "",
    acres: f?.acres != null ? String(f.acres) : "",
    cropType: f?.cropType ?? "",
    product: f?.product ?? "",
    rate: f?.rate ?? "",
    status: f?.status ?? "pending",
    scheduledDate: f?.scheduledDate ?? "",
    sprayedDate: f?.sprayedDate ?? "",
    notes: f?.notes ?? "",
  };
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "sprayed", label: "Sprayed" },
  { value: "skipped", label: "Skipped" },
];

const CROP_OPTIONS = ["Corn", "Soybeans", "Wheat", "Sorghum", "Cotton", "Pasture", "Other"];

export function FieldForm({
  field,
  fixedCustomerId,
  onSuccess,
  onCancel,
}: {
  field?: Field | null;
  fixedCustomerId?: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const { data: customers } = useQuery<Customer[]>({ queryKey: ["/api/customers"] });
  const form = useForm<FormValues>({
    defaultValues: fieldToForm(field, fixedCustomerId),
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: any = {
        customerId: Number(values.customerId),
        name: values.name.trim(),
        location: values.location || null,
        latitude: values.latitude === "" ? null : Number(values.latitude),
        longitude: values.longitude === "" ? null : Number(values.longitude),
        acres: values.acres === "" ? null : Number(values.acres),
        cropType: values.cropType || null,
        product: values.product || null,
        rate: values.rate || null,
        status: values.status || "pending",
        scheduledDate: values.scheduledDate || null,
        sprayedDate: values.sprayedDate || null,
        notes: values.notes || null,
      };
      // Validate via shared schema
      const parsed = insertFieldSchema.partial({ customerId: false } as any).safeParse(payload);
      if (!parsed.success && !field) {
        throw new Error(parsed.error.errors.map(e => e.message).join(", "));
      }
      const url = field ? `/api/fields/${field.id}` : "/api/fields";
      const method = field ? "PATCH" : "POST";
      const res = await apiRequest(method, url, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: field ? "Field updated" : "Field added" });
      onSuccess();
    },
    onError: (e: any) => toast({
      title: "Could not save field",
      description: e.message,
      variant: "destructive",
    }),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        {!fixedCustomerId && (
          <FormField control={form.control} name="customerId" rules={{ required: "Customer is required" }} render={({ field: f }) => (
            <FormItem>
              <FormLabel>Customer *</FormLabel>
              <Select
                onValueChange={(v) => f.onChange(Number(v))}
                value={f.value ? String(f.value) : undefined}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(customers ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)} data-testid={`option-customer-${c.id}`}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <FormField control={form.control} name="name" rules={{ required: "Field name is required" }} render={({ field: f }) => (
          <FormItem>
            <FormLabel>Field name *</FormLabel>
            <FormControl><Input data-testid="input-field-name" placeholder="North 40, Smith Bottom, etc." {...f} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="location" render={({ field: f }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl><Input data-testid="input-field-location" placeholder="Address or landmark description" {...f} /></FormControl>
            <FormDescription>Use an address, road name, or short directions.</FormDescription>
            <FormMessage />
          </FormItem>
        )} />

        <FormItem>
          <FormLabel>Pin on map</FormLabel>
          <FormControl>
            <FieldMapPicker
              latitude={form.watch("latitude") === "" ? null : Number(form.watch("latitude"))}
              longitude={form.watch("longitude") === "" ? null : Number(form.watch("longitude"))}
              onChange={(lat, lng) => {
                form.setValue("latitude", lat == null ? "" : String(lat), { shouldDirty: true });
                form.setValue("longitude", lng == null ? "" : String(lng), { shouldDirty: true });
              }}
              addressHint={form.watch("location")}
              testIdPrefix="employee-field-map"
            />
          </FormControl>
          <FormDescription>Tap the map to drop a pin. Switch to satellite to see the field outline.</FormDescription>
        </FormItem>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField control={form.control} name="acres" render={({ field: f }) => (
            <FormItem>
              <FormLabel>Acres</FormLabel>
              <FormControl><Input data-testid="input-field-acres" inputMode="decimal" placeholder="40" {...f} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="cropType" render={({ field: f }) => (
            <FormItem>
              <FormLabel>Crop</FormLabel>
              <Select onValueChange={f.onChange} value={f.value || undefined}>
                <FormControl>
                  <SelectTrigger data-testid="select-crop"><SelectValue placeholder="Select crop" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CROP_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c} data-testid={`option-crop-${c}`}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="rounded-md border border-border bg-accent/30 p-4 space-y-3">
          <div className="text-sm font-medium">Spray plan</div>
          <FormField control={form.control} name="product" render={({ field: f }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <FormControl><Input data-testid="input-field-product" placeholder="e.g. Veltyma, Miravis Neo, glyphosate" {...f} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="rate" render={({ field: f }) => (
            <FormItem>
              <FormLabel>Application rate</FormLabel>
              <FormControl><Input data-testid="input-field-rate" placeholder="e.g. 7 oz/acre, 2 gal/acre" {...f} /></FormControl>
              <FormDescription>Include units (oz/ac, gal/ac, lb/ac).</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FormField control={form.control} name="status" render={({ field: f }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={f.onChange} value={f.value || "pending"}>
                <FormControl>
                  <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value} data-testid={`option-status-${s.value}`}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="scheduledDate" render={({ field: f }) => (
            <FormItem>
              <FormLabel>Scheduled</FormLabel>
              <FormControl><Input data-testid="input-field-scheduled" type="date" {...f} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="sprayedDate" render={({ field: f }) => (
            <FormItem>
              <FormLabel>Sprayed on</FormLabel>
              <FormControl><Input data-testid="input-field-sprayed" type="date" {...f} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field: f }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl><Textarea data-testid="input-field-notes" rows={3} placeholder="Buffers, sensitive neighbors, gate codes, etc." {...f} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-field">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-field">
            {mutation.isPending ? "Saving…" : field ? "Save changes" : "Add field"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
