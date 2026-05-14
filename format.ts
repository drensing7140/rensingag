import { useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ArrowLeft, Phone, Mail, MapPin, Pencil, Trash2, Navigation } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Customer, Field } from "@shared/schema";
import { fmtAcres, fmtDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import { FieldForm } from "@/components/FieldForm";

type CustomerWithFields = Customer & { fields: Field[] };

export default function CustomerDetail() {
  const [, params] = useRoute<{ id: string }>("/customers/:id");
  const id = Number(params?.id);
  const { data, isLoading } = useQuery<CustomerWithFields>({
    queryKey: ["/api/customers", id],
    enabled: !!id,
  });
  const { toast } = useToast();
  const [openNew, setOpenNew] = useState(false);
  const [editField, setEditField] = useState<Field | null>(null);
  const delField = useMutation({
    mutationFn: async (fid: number) => apiRequest("DELETE", `/api/fields/${fid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      toast({ title: "Field removed" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-md" />
        <Skeleton className="h-64 rounded-md" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link href="/employee/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Link>
        <Card className="border-card-border">
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            Customer not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalAcres = data.fields.reduce((s, f) => s + (f.acres ?? 0), 0);
  const sprayedAcres = data.fields.filter((f) => f.status === "sprayed").reduce((s, f) => s + (f.acres ?? 0), 0);

  return (
    <div className="space-y-6">
      <Link href="/employee/customers" data-testid="link-back-customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-customer-name">{data.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.fields.length} field{data.fields.length === 1 ? "" : "s"} · {fmtAcres(totalAcres)} total · {fmtAcres(sprayedAcres)} sprayed
          </p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-field" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add field for {data.name}</DialogTitle></DialogHeader>
            <FieldForm
              fixedCustomerId={data.id}
              onSuccess={() => {
                setOpenNew(false);
                queryClient.invalidateQueries({ queryKey: ["/api/customers", id] });
              }}
              onCancel={() => setOpenNew(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-card-border">
        <CardHeader className="pb-3"><CardTitle className="text-base">Contact</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {data.phone ? (
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /><a href={`tel:${data.phone}`} className="hover:text-foreground">{data.phone}</a></div>
          ) : <div className="italic text-xs">No phone</div>}
          {data.email ? (
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /><a href={`mailto:${data.email}`} className="hover:text-foreground">{data.email}</a></div>
          ) : <div className="italic text-xs">No email</div>}
          {data.address && (
            <div className="flex items-start gap-2 sm:col-span-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /><span>{data.address}</span></div>
          )}
          {data.notes && (
            <div className="sm:col-span-2 mt-1 rounded-md bg-accent/40 p-3 text-sm text-foreground" data-testid="text-customer-notes">
              {data.notes}
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Fields</h2>
        {data.fields.length === 0 ? (
          <Card className="border-card-border">
            <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground" data-testid="empty-customer-fields">
              No fields for this customer yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {data.fields.map((f) => {
              const href = f.latitude != null && f.longitude != null
                ? `https://maps.google.com/?q=${f.latitude},${f.longitude}`
                : f.location ? `https://maps.google.com/?q=${encodeURIComponent(f.location)}` : null;
              return (
                <Card key={f.id} data-testid={`card-customer-field-${f.id}`} className="border-card-border">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{f.name}</h3>
                          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", STATUS_COLORS[f.status] ?? STATUS_COLORS.pending)}>
                            {STATUS_LABELS[f.status] ?? f.status}
                          </span>
                          {f.cropType && <span className="text-xs text-muted-foreground">· {f.cropType}</span>}
                        </div>
                        {f.location && <div className="mt-1 text-xs text-muted-foreground">{f.location}</div>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          data-testid={`button-edit-customer-field-${f.id}`}
                          onClick={() => setEditField(f)}
                          aria-label="Edit field"
                          className="hover-elevate rounded p-2 text-muted-foreground hover:text-foreground"
                        ><Pencil className="h-4 w-4" /></button>
                        <button
                          data-testid={`button-delete-customer-field-${f.id}`}
                          onClick={() => { if (confirm(`Delete field "${f.name}"?`)) delField.mutate(f.id); }}
                          aria-label="Delete field"
                          className="hover-elevate rounded p-2 text-muted-foreground hover:text-destructive"
                        ><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div><div className="text-xs uppercase tracking-wide text-muted-foreground">Product</div><div className="font-medium">{f.product ?? "—"}</div></div>
                      <div><div className="text-xs uppercase tracking-wide text-muted-foreground">Rate</div><div className="font-medium tabular-nums">{f.rate ?? "—"}</div></div>
                      <div><div className="text-xs uppercase tracking-wide text-muted-foreground">Acres</div><div className="font-medium tabular-nums">{fmtAcres(f.acres)}</div></div>
                      <div><div className="text-xs uppercase tracking-wide text-muted-foreground">{f.status === "sprayed" ? "Sprayed" : "Scheduled"}</div><div className="font-medium tabular-nums">{fmtDate(f.status === "sprayed" ? f.sprayedDate : f.scheduledDate)}</div></div>
                    </div>
                    {href && (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="hover-elevate mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium">
                        <Navigation className="h-3.5 w-3.5" /> Directions
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={editField !== null} onOpenChange={(o) => !o && setEditField(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit field</DialogTitle></DialogHeader>
          {editField && (
            <FieldForm
              field={editField}
              fixedCustomerId={data.id}
              onSuccess={() => {
                setEditField(null);
                queryClient.invalidateQueries({ queryKey: ["/api/customers", id] });
              }}
              onCancel={() => setEditField(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
