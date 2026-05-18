import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl">Maren &amp; Sage</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Botanical skincare made in small batches, with ingredients you can trace from soil to skin.
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-medium">Shop</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/shop" className="hover:text-foreground">All products</Link></li>
            <li><Link to="/about" className="hover:text-foreground">Our story</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="mb-3 font-medium text-foreground">Visit</p>
          <p>14 Linden Lane<br/>Brooklyn, NY 11201</p>
          <p className="mt-3">hello@marenandsage.com</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Maren &amp; Sage. All rights reserved.
      </div>
    </footer>
  );
}
