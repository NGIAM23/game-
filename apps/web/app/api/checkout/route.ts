import { NextRequest, NextResponse } from "next/server";
import { stripe, SPARKS_PACKS, PLUS_PRICE_CENTS } from "@/lib/stripe";
import { supabaseForUser } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { kind, packId, accessToken } = await req.json();
  if (!accessToken) return NextResponse.json({ error: "Missing session" }, { status: 401 });

  const supabase = supabaseForUser(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const origin = req.headers.get("origin") ?? "https://luavio.fr";

  if (kind === "plus_subscription") {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: PLUS_PRICE_CENTS,
            recurring: { interval: "month" },
            product_data: { name: "luavio+" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: userData.user.id, kind: "plus_subscription" },
      success_url: `${origin}/shop?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  }

  if (kind === "sparks_pack") {
    const pack = SPARKS_PACKS.find((p) => p.id === packId);
    if (!pack) return NextResponse.json({ error: "Unknown pack" }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: pack.amountCents,
            product_data: { name: pack.label },
          },
          quantity: 1,
        },
      ],
      metadata: { userId: userData.user.id, kind: "sparks_pack", sparksAwarded: String(pack.sparks) },
      success_url: `${origin}/shop?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop?canceled=1`,
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
}
