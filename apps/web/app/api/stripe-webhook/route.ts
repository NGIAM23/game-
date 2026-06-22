import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAnon } from "@/lib/supabaseServer";

// Fallback de fiabilité au cas où l'utilisateur ferme l'onglet avant que /shop
// n'appelle /api/checkout/confirm. À configurer dans Stripe Dashboard → Webhooks
// une fois déployé, en pointant vers https://<ton-domaine>/api/stripe-webhook.
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: Record<string, string>; amount_total?: number };
    const userId = session.metadata?.userId;
    const kind = session.metadata?.kind;
    if (userId && kind) {
      const sparksAwarded = kind === "sparks_pack" ? Number(session.metadata?.sparksAwarded ?? 0) : 0;
      await supabaseAnon.rpc("credit_payment", {
        p_user_id: userId,
        p_stripe_session_id: session.id,
        p_kind: kind,
        p_sparks_awarded: sparksAwarded,
        p_amount_cents: session.amount_total ?? 0,
        p_secret: process.env.INTERNAL_CREDIT_SECRET,
      });
    }
  }

  return NextResponse.json({ received: true });
}
