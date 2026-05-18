import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const { items, total, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", address: "", city: "", zip: "", country: "United States", phone: "", notes: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/checkout" } });
  }, [loading, user, navigate]);

  if (items.length === 0) {
    return (
      <div className="py-32 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/shop" className="mt-4 inline-block text-sm underline">Continue shopping</Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          status: "pending",
          shipping_name: form.name,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_zip: form.zip,
          shipping_country: form.country,
          phone: form.phone,
          notes: form.notes || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: itemsErr } = await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          product_name: i.name,
          price: i.price,
          quantity: i.quantity,
        }))
      );
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Order placed!");
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-[1fr_340px]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="text-sm text-muted-foreground">Shipping information</p>
        {(["name", "address", "city", "zip", "country", "phone"] as const).map((f) => (
          <input
            key={f}
            required={f !== "phone"}
            value={form[f]}
            onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            placeholder={{ name: "Full name", address: "Street address", city: "City", zip: "Postal code", country: "Country", phone: "Phone (optional)" }[f]}
            className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
          />
        ))}
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Order notes (optional)"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring"
        />
        <button disabled={submitting} className="w-full rounded-full bg-primary py-3 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {submitting ? "Placing order…" : `Place order · $${total.toFixed(2)}`}
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Payment isn't collected in this demo — orders are saved for the team to fulfill manually.
        </p>
      </form>
      <aside className="h-fit rounded-md border border-border bg-card p-6">
        <p className="font-display text-2xl">Order</p>
        <div className="mt-4 space-y-3 text-sm">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between gap-3">
              <span>{i.name} <span className="text-muted-foreground">× {i.quantity}</span></span>
              <span className="tabular-nums">${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-between border-t border-border pt-5 text-sm">
          <span>Total</span><span className="font-medium tabular-nums">${total.toFixed(2)}</span>
        </div>
      </aside>
    </section>
  );
}
