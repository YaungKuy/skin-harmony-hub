import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [
    { title: "About — Maren & Sage" },
    { name: "description", content: "Our story: small-batch botanical skincare from Brooklyn." },
  ]}),
});

function About() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs uppercase tracking-[0.25em] text-clay">Our story</p>
      <h1 className="mt-4 font-display text-5xl md:text-6xl">A garden, a kitchen, a brand.</h1>
      <div className="prose prose-stone mt-10 max-w-none space-y-6 text-lg leading-relaxed text-muted-foreground">
        <p>
          Maren &amp; Sage began in 2021, in a sunny Brooklyn kitchen, with one stubborn idea: skincare doesn't have to be loud to work.
        </p>
        <p>
          We source single-origin botanicals from small farms — rosehip from Chile, sage from upstate New York, sweet almond from Sicily — and formulate in small batches you can taste-test on the back of your hand.
        </p>
        <p>
          Every product carries a batch number that links back to its harvest, its formulator, and the day it left the lab. No greenwashing, no celebrity endorsements, no twelve-step routines. Just quietly effective skincare, made with care.
        </p>
        <p className="font-display text-2xl text-foreground">
          Slow is a feature, not a bug.
        </p>
      </div>
    </article>
  );
}
