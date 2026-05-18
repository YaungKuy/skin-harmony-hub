import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/shop")({
  component: Shop,
  head: () => ({ meta: [
    { title: "Shop — Maren & Sage" },
    { name: "description", content: "Browse our full range of botanical skincare." },
  ]}),
});

function Shop() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, price, image_url, category")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="border-b border-border pb-10">
        <p className="text-xs uppercase tracking-[0.25em] text-clay">All products</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">The full range</h1>
      </div>
      {isLoading ? (
        <p className="py-20 text-center text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((p) => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </section>
  );
}
