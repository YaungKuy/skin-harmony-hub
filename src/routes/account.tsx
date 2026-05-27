import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  component: Account,
});

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", search: { redirect: "/account" } });
  }, [loading, user, navigate]);

  const { data: orders } = useQuery({
    enabled: !!user,
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total, status, order_items(product_name, quantity, price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!user) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Account</p>
          <h1 className="mt-3 font-display text-5xl">Hello, {user.email}</h1>
        </div>
        <button onClick={signOut} className="rounded-full border border-border px-5 py-2 text-sm hover:bg-secondary">Sign out</button>
      </div>

      <h2 className="mt-14 font-display text-2xl">Your orders</h2>
      {!orders || orders.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-border py-12 text-center">
          <p className="text-muted-foreground">No orders yet.</p>
          <Link to="/shop" className="mt-4 inline-block text-sm underline">Start shopping</Link>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-border">
          {orders.map((o) => (
            <div key={o.id} className="py-6">
              <div className="flex flex-wrap justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                  <p className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">${Number(o.total).toFixed(2)}</p>
                  <span className="inline-block rounded-full bg-secondary px-3 py-0.5 text-xs capitalize">{o.status}</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {(o.order_items ?? []).map((i, idx) => (
                  <li key={idx}>{i.product_name} × {i.quantity}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
