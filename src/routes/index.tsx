import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/product-card";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Maren & Sage — Botanical Skincare" },
      { name: "description", content: "Small-batch botanical skincare, made with traceable, plant-forward ingredients." },
    ],
  }),
});

function Index() {
  const { data: featured } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, price, image_url, category")
        .eq("featured", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-10 md:grid-cols-2 md:gap-16 md:pt-20">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Est. 2021 · Brooklyn</p>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
            Skincare,<br/>rooted in the<br/><em className="text-clay">garden</em>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Cold-pressed oils, botanical extracts, and quietly effective formulas — made in small batches and built for everyday rituals.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/shop" className="rounded-full bg-primary px-7 py-3 text-sm text-primary-foreground transition hover:opacity-90">
              Shop the range
            </Link>
            <Link to="/about" className="rounded-full border border-border px-7 py-3 text-sm transition hover:bg-secondary">
              Our story
            </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="Skincare serum and cream with botanicals"
            width={1600}
            height={1200}
            className="aspect-[4/5] w-full rounded-md object-cover shadow-[0_30px_80px_-30px_rgba(70,40,20,0.35)]"
          />
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-clay">Selected</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Quiet essentials</h2>
          </div>
          <Link to="/shop" className="hidden text-sm text-muted-foreground hover:text-foreground md:block">
            See all →
          </Link>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {(featured ?? []).map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      {/* Philosophy band */}
      <section className="bg-secondary/50 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-clay">Our philosophy</p>
          <p className="mt-6 font-display text-3xl leading-snug md:text-4xl">
            "We believe skincare should feel like tending a garden — slow, intentional, and a little wild."
          </p>
          <p className="mt-6 text-sm text-muted-foreground">— Maren Holt, Founder</p>
        </div>
      </section>
    </>
  );
}
