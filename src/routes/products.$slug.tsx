import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$slug")({
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="py-32 text-center text-muted-foreground">Loading…</div>;
  if (!data) return (
    <div className="py-32 text-center">
      <p className="text-muted-foreground">Product not found.</p>
      <Link to="/shop" className="mt-4 inline-block text-sm underline">Back to shop</Link>
    </div>
  );

  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
      <div className="aspect-[4/5] overflow-hidden rounded-md bg-secondary/60">
        {data.image_url && (
          <img src={data.image_url} alt={data.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.25em] text-clay">{data.category}</p>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{data.name}</h1>
        <p className="mt-5 text-2xl tabular-nums">${Number(data.price).toFixed(2)}</p>
        <p className="mt-8 leading-relaxed text-muted-foreground">{data.description}</p>
        <div className="mt-10 flex gap-3">
          <button
            onClick={() => {
              add({ id: data.id, name: data.name, price: Number(data.price), image_url: data.image_url });
              toast.success(`${data.name} added to cart`);
            }}
            disabled={data.stock <= 0}
            className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            {data.stock > 0 ? "Add to cart" : "Sold out"}
          </button>
          <button
            onClick={() => {
              add({ id: data.id, name: data.name, price: Number(data.price), image_url: data.image_url });
              navigate({ to: "/cart" });
            }}
            disabled={data.stock <= 0}
            className="rounded-full border border-border px-8 py-3 text-sm transition hover:bg-secondary disabled:opacity-40"
          >
            Buy now
          </button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          {data.stock > 0 ? `${data.stock} in stock` : "Out of stock"} · Ships in 2–3 days
        </p>
      </div>
    </section>
  );
}
