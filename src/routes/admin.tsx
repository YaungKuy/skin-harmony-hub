import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

type Tab = "overview" | "products" | "orders";

function Admin() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (role && role !== "admin") {
      toast.error("Admin access required");
      navigate({ to: "/" });
    }
  }, [user, role, loading, navigate]);

  if (loading || !user || role === null) {
    return <p className="py-20 text-center text-muted-foreground">Loading…</p>;
  }
  if (role !== "admin") return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <div className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.25em] text-clay">Admin</p>
        <h1 className="mt-2 font-display text-4xl">Dashboard</h1>
        <nav className="mt-6 flex gap-6 text-sm">
          {(["overview", "products", "orders"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 capitalize transition ${tab === t ? "border-b-2 border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {tab === "overview" && <Overview />}
        {tab === "products" && <ProductsAdmin />}
        {tab === "orders" && <OrdersAdmin />}
      </div>
    </section>
  );
}

function Overview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total"),
      ]);
      const revenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total), 0);
      return {
        productCount: products.count ?? 0,
        orderCount: orders.data?.length ?? 0,
        revenue,
      };
    },
  });

  const cards = [
    { label: "Products", value: data?.productCount ?? "—" },
    { label: "Orders", value: data?.orderCount ?? "—" },
    { label: "Revenue", value: `$${(data?.revenue ?? 0).toFixed(2)}` },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-md border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
          <p className="mt-2 font-display text-4xl">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  return (
    <div>
      <div className="flex justify-end">
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>
      {isLoading ? <p className="py-12 text-center text-muted-foreground">Loading…</p> : (
        <div className="mt-6 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Featured</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-muted-foreground">{p.category}</td>
                  <td className="p-3 tabular-nums">${Number(p.price).toFixed(2)}</td>
                  <td className="p-3 tabular-nums">{p.stock}</td>
                  <td className="p-3">{p.featured ? "Yes" : "—"}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(p)} className="rounded p-1.5 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-destructive hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <ProductForm initial={editing} onClose={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["admin-products"] }); }} />}
    </div>
  );
}

function ProductForm({ initial, onClose }: { initial: any; onClose: () => void }) {
  const [form, setForm] = useState({
    name: initial.name ?? "",
    slug: initial.slug ?? "",
    description: initial.description ?? "",
    price: initial.price ?? "",
    image_url: initial.image_url ?? "",
    category: initial.category ?? "skincare",
    stock: initial.stock ?? 0,
    featured: initial.featured ?? false,
  });
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const slug = (form.slug || form.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || `product-${Date.now()}`;
    const payload = {
      ...form,
      slug,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      image_url: form.image_url || null,
    };
    const { error } = initial.id
      ? await supabase.from("products").update(payload).eq("id", initial.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(initial.id ? "Updated" : "Created");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md bg-card p-6 shadow-xl">
        <h3 className="font-display text-2xl">{initial.id ? "Edit product" : "New product"}</h3>
        <div className="mt-5 space-y-3 text-sm">
          {[
            ["name", "Name", "text"], ["slug", "Slug (auto if blank)", "text"], ["category", "Category", "text"], ["price", "Price", "number"], ["stock", "Stock", "number"], ["image_url", "Image URL", "text"],
          ].map(([k, label, type]) => (
            <input key={k} type={type} step={k === "price" ? "0.01" : "1"} min={type === "number" ? "0" : undefined} required={k === "name" || k === "price"} value={(form as any)[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={label} className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-ring" />
          ))}
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Description" className="w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus:border-ring" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured on homepage</label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm hover:bg-secondary">Cancel</button>
          <button disabled={busy} className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

function OrdersAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(product_name, quantity, price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  if (!data || data.length === 0) return <p className="py-12 text-center text-muted-foreground">No orders yet.</p>;

  return (
    <div className="space-y-4">
      {data.map((o) => (
        <div key={o.id} className="rounded-md border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">#{o.id.slice(0, 8)} · {o.shipping_name}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">{o.shipping_address}, {o.shipping_city} {o.shipping_zip}, {o.shipping_country}</p>
              {o.phone && <p className="text-xs text-muted-foreground">{o.phone}</p>}
            </div>
            <div className="text-right">
              <p className="font-display text-xl tabular-nums">${Number(o.total).toFixed(2)}</p>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="mt-1 rounded-md border border-border bg-background px-2 py-1 text-xs">
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {(o.order_items ?? []).map((i: any, idx: number) => (
              <li key={idx}>{i.product_name} × {i.quantity} <span className="tabular-nums">— ${(Number(i.price) * i.quantity).toFixed(2)}</span></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
