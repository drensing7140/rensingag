import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, SprayCan, Clock } from "lucide-react";
import type { Customer, FieldWithCustomer } from "@shared/schema";
import { fmtAcres, fmtDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

function Stat({ label, value, icon: Icon, testId }: { label: string; value: string | number; icon: any; testId: string }) {
  return (
    <Card data-testid={testId} className="border-card-border">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="text-xl font-semibold leading-tight" data-testid={`${testId}-value`}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const customersQ = useQuery<Customer[]>({ queryKey: ["/api/customers"] });
  const fieldsQ = useQuery<FieldWithCustomer[]>({ queryKey: ["/api/fields"] });

  const fields = fieldsQ.data ?? [];
  const customers = customersQ.data ?? [];
  const pending = fields.filter((f) => f.status === "pending" || f.status === "scheduled");
  const totalAcres = fields.reduce((sum, f) => sum + (f.acres ?? 0), 0);
  const sprayedAcres = fields
    .filter((f) => f.status === "sprayed")
    .reduce((sum, f) => sum + (f.acres ?? 0), 0);

  const loading = customersQ.isLoading || fieldsQ.isLoading;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of customers, fields, and pending spray jobs.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Customers" value={customers.length} icon={Users} testId="stat-customers" />
          <Stat label="Fields" value={fields.length} icon={MapPin} testId="stat-fields" />
          <Stat label="Pending acres" value={fmtAcres(pending.reduce((s, f) => s + (f.acres ?? 0), 0))} icon={Clock} testId="stat-pending-acres" />
          <Stat label="Sprayed acres" value={`${fmtAcres(sprayedAcres)} / ${fmtAcres(totalAcres)}`} icon={SprayCan} testId="stat-sprayed-acres" />
        </div>
      )}

      <Card className="border-card-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Upcoming spray jobs</CardTitle>
          <Link href="/employee/fields" data-testid="link-view-all-fields" className="text-xs font-medium text-primary hover-elevate rounded px-2 py-1">
            View all fields →
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
            </div>
          ) : pending.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground" data-testid="empty-pending">
              No pending fields. Add a field to schedule a spray.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {pending.slice(0, 8).map((f) => (
                <li
                  key={f.id}
                  data-testid={`row-pending-field-${f.id}`}
                  className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate" data-testid={`text-field-name-${f.id}`}>{f.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {f.customerName} · {f.product ?? "No product set"} · {f.rate ?? "rate TBD"}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                    {fmtAcres(f.acres)} · {fmtDate(f.scheduledDate)}
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
                      STATUS_COLORS[f.status] ?? STATUS_COLORS.pending
                    )}
                    data-testid={`status-${f.id}`}
                  >
                    {STATUS_LABELS[f.status] ?? f.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
