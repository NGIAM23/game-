import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const SPARKS_PACKS = [
  { id: "sparks-99", sparks: 100, amountCents: 99, label: "100 Sparks" },
  { id: "sparks-499", sparks: 650, amountCents: 499, label: "650 Sparks" },
  { id: "sparks-999", sparks: 1500, amountCents: 999, label: "1500 Sparks" },
  { id: "sparks-1999", sparks: 3400, amountCents: 1999, label: "3400 Sparks" },
  { id: "sparks-4999", sparks: 10000, amountCents: 4999, label: "10000 Sparks" },
] as const;

export const PLUS_PRICE_CENTS = 499;
