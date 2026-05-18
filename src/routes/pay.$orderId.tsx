import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import khqr from "@/assets/khqr.jpg";

export const Route = createFileRoute("/pay/$orderId")({
  component: Pay,
});

function Pay() {
  const { orderId } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: `/pay/${orderId}` } });
  }, [loading, user, orderId, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("*").eq("id", orderId).maybeSingle().then(({ data }) => setOrder(data));
  }, [user, orderId]);

  async function confirmPaid() {
    setConfirming(true);
    const { error } = await supabase.from("orders").update({ status: "processing" }).eq("id", orderId);
    setConfirming(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks! We'll verify your payment shortly.");
    navigate({ to: "/account" });
  }

  if (!order) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;

  const ref = `ORDER-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-clay">Payment</p>
      <h1 className="mt-2 font-display text-4xl">Scan to pay with KHQR</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Open your banking app (ABA, ACLEDA, Wing, or any Bakong-enabled app), scan the QR below and pay the exact amount. Use the reference code when sending.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center">
        <img src={khqr} alt="KHQR payment code" width={320} height={320} loading="lazy" className="mx-auto h-72 w-72 rounded-md object-contain" />
        <div className="mt-6 grid grid-cols-2 gap-3 text-left text-sm">
          <div className="rounded-md bg-secondary/60 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Amount</p>
            <p className="mt-1 font-display text-2xl tabular-nums">${Number(order.total).toFixed(2)}</p>
          </div>
          <div className="rounded-md bg-secondary/60 p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Reference</p>
            <p className="mt-1 font-mono text-sm">{ref}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Add the reference code in the payment note so we can match it to your order.</p>
      </div>

      <button
        onClick={confirmPaid}
        disabled={confirming || order.status !== "pending"}
        className="mt-6 w-full rounded-full bg-primary py-3 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {order.status !== "pending" ? "Payment submitted" : confirming ? "Submitting…" : "I've paid — confirm"}
      </button>
      <Link to="/account" className="mt-4 block text-center text-xs text-muted-foreground underline">View my orders</Link>
    </section>
  );
}
