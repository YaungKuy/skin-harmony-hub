import { Link } from "@tanstack/react-router";
import { ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";

export function SiteHeader() {
  const { user, role } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-display text-2xl tracking-wide">
          Maren <span className="text-clay">&amp;</span> Sage
        </Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">Home</Link>
          <Link to="/shop" activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">Shop</Link>
          <Link to="/about" activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">About</Link>
          <Link to="/contact" activeProps={{ className: "text-foreground" }} className="text-muted-foreground transition hover:text-foreground">Contact</Link>
          {role === "admin" && (
            <Link to="/admin" activeProps={{ className: "text-foreground" }} className="text-clay transition hover:text-foreground">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to={user ? "/account" : "/login"}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            className="relative rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
