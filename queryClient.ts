import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCustomerSchema, type Customer, type InsertCustomer } from "@shared/schema";

function NewCustomerDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<InsertCustomer>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: { name: "", phone: "", email: "", address: "", notes: "" },
  });
  const mutation = useMutation({
    mutationFn: async (data: InsertCustomer) => {
      const res = await apiRequest("POST", "/api/customers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({ title: "Customer added" });
      setOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Could not save customer", variant: "destructive" }),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-customer" size="sm">
          <Plus className="h-4 w-4 mr-1" /> New customer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
            className="space-y-4"
          >
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl><Input data-testid="input-customer-name" placeholder="John Smith" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input data-testid="input-customer-phone" placeholder="(618) 555-0123" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input data-testid="input-customer-email" type="email" placeholder="john@farm.com" {...field} value={field.value ?? ""} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl><Input data-testid="input-customer-address" placeholder="123 Country Rd, Edwardsville, IL" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea data-testid="input-customer-notes" rows={3} placeholder="Preferred contact times, billing notes, etc." {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-customer">
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} data-testid="button-save-customer">
                {mutation.isPending ? "Saving…" : "Save customer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Customers() {
  const { data: customers, isLoading } = useQuery<Customer[]>({ queryKey: ["/api/customers"] });
  const { toast } = useToast();
  const del = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fields"] });
      toast({ title: "Customer removed" });
    },
  });
  const [search, setSearch] = useState("");
  const filtered = (customers ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Growers and landowners we spray for.</p>
        </div>
        <NewCustomerDialog />
      </header>

      <div className="flex items-center gap-2">
        <Input
          data-testid="input-customer-search"
          placeholder="Search by name, phone, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-md" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-card-border">
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground" data-testid="empty-customers">
            {customers && customers.length === 0
              ? "No customers yet. Add your first one to get started."
              : "No customers match that search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} data-testid={`card-customer-${c.id}`} className="border-card-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    <Link
                      href={`/employee/customers/${c.id}`}
                      data-testid={`link-customer-${c.id}`}
                      className="hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  </CardTitle>
                  <button
                    data-testid={`button-delete-customer-${c.id}`}
                    aria-label={`Delete ${c.name}`}
                    onClick={() => {
                      if (confirm(`Delete ${c.name} and all their fields?`)) del.mutate(c.id);
                    }}
                    className="hover-elevate -mr-1 rounded p-1 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 pb-4 text-sm text-muted-foreground">
                {c.phone && (
                  <div className="flex items-center gap-2" data-testid={`text-phone-${c.id}`}>
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <a href={`tel:${c.phone}`} className="truncate hover:text-foreground">{c.phone}</a>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2" data-testid={`text-email-${c.id}`}>
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${c.email}`} className="truncate hover:text-foreground">{c.email}</a>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-start gap-2" data-testid={`text-address-${c.id}`}>
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span className="truncate">{c.address}</span>
                  </div>
                )}
                {!c.phone && !c.email && !c.address && (
                  <div className="italic text-xs">No contact info</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
