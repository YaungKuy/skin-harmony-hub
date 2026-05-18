import { Link } from "@tanstack/react-router";

export interface ProductCardProps {
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
}

export function ProductCard(p: ProductCardProps) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: p.slug }}
      className="group block"
    >
      <div className="aspect-[4/5] overflow-hidden rounded-md bg-secondary/60">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{p.category}</p>
          <p className="mt-1 font-display text-lg leading-tight">{p.name}</p>
        </div>
        <p className="mt-1 text-sm tabular-nums">${p.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
