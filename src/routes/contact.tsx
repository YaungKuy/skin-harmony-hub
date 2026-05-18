import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [
    { title: "Contact — Maren & Sage" },
    { name: "description", content: "Get in touch with the Maren & Sage team." },
  ]}),
});

function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <section className="mx-auto grid max-w-5xl gap-16 px-6 py-20 md:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-clay">Contact</p>
        <h1 className="mt-4 font-display text-5xl">Say hello.</h1>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Questions about an order, ingredients, or wholesale? We read every message and reply within two business days.
        </p>
        <div className="mt-10 space-y-3 text-sm">
          <p><span className="text-muted-foreground">Email · </span>hello@marenandsage.com</p>
          <p><span className="text-muted-foreground">Studio · </span>14 Linden Lane, Brooklyn NY</p>
          <p><span className="text-muted-foreground">Hours · </span>Mon–Fri, 10–6</p>
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSending(true);
          setTimeout(() => { setSending(false); toast.success("Thanks — we'll be in touch."); (e.target as HTMLFormElement).reset(); }, 600);
        }}
        className="space-y-4"
      >
        <input required name="name" placeholder="Your name" className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring" />
        <input required type="email" name="email" placeholder="Email" className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring" />
        <textarea required name="message" placeholder="Message" rows={6} className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring" />
        <button disabled={sending} className="rounded-full bg-primary px-8 py-3 text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          {sending ? "Sending…" : "Send message"}
        </button>
      </form>
    </section>
  );
}
