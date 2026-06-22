import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const SPARKS_PACKS = [
  { id: "sparks-99", sparks: 100, amountCents: 99, label: "100 Sparks" },
  { id: "sparks-499", sparks: 550, amountCents: 499, label: "550 Sparks" },
  { id: "sparks-999", sparks: 1200, amountCents: 999, label: "1200 Sparks" },
  { id: "sparks-1999", sparks: 2600, amountCents: 1999, label: "2600 Sparks" },
  { id: "sparks-4999", sparks: 7000, amountCents: 4999, label: "7000 Sparks" },
] as const;

export const PLUS_PRICE_CENTS = 399;
