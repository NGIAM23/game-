import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseForUser } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const { sessionId, accessToken } = await req.json();
  if (!sessionId || !accessToken) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const supabase = supabaseForUser(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }
  if (session.metadata?.userId !== userData.user.id) {
    return NextResponse.json({ error: "Session does not belong to this user" }, { status: 403 });
  }

  const kind = session.metadata?.kind ?? "";
  const sparksAwarded = kind === "sparks_pack" ? Number(session.metadata?.sparksAwarded ?? 0) : 0;

  const { error: rpcError } = await supabase.rpc("credit_payment", {
    p_user_id: userData.user.id,
    p_stripe_session_id: session.id,
    p_kind: kind,
    p_sparks_awarded: sparksAwarded,
    p_amount_cents: session.amount_total ?? 0,
    p_secret: process.env.INTERNAL_CREDIT_SECRET,
  });

  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 });

  return NextResponse.json({ ok: true, kind, sparksAwarded });
}
