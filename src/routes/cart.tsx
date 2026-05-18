import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/hooks/use-cart";
import { Minus, Plus, X } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total } = useCart();

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-5xl">Your cart</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground hover:opacity-90">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_360px]">
          <div className="divide-y divide-border">
            {items.map((i) => (
              <div key={i.id} className="flex gap-5 py-6">
                <div className="h-28 w-24 shrink-0 overflow-hidden rounded-md bg-secondary/60">
                  {i.image_url && <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-display text-xl">{i.name}</p>
                    <p className="tabular-nums">${(i.price * i.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button onClick={() => setQty(i.id, i.quantity - 1)} className="p-2 hover:bg-secondary"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm tabular-nums">{i.quantity}</span>
                      <button onClick={() => setQty(i.id, i.quantity + 1)} className="p-2 hover:bg-secondary"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => remove(i.id)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-md border border-border bg-card p-6">
            <p className="font-display text-2xl">Summary</p>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Calculated at checkout</span></div>
            </div>
            <div className="mt-5 flex justify-between border-t border-border pt-5">
              <span>Total</span><span className="font-medium tabular-nums">${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="mt-6 block rounded-full bg-primary py-3 text-center text-sm text-primary-foreground hover:opacity-90">
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}
