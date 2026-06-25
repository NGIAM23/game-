import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseForUser } from "@/lib/supabaseServer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function POST(req: NextRequest) {
  const { taskLabel, imageBase64, mimeType, expectedEvidence, accessToken } = await req.json();
  if (!accessToken) return NextResponse.json({ error: "Missing session" }, { status: 401 });

  const supabase = supabaseForUser(accessToken);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  if (!taskLabel || !imageBase64) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }
  if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "Unsupported mime type" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const evidenceLine = expectedEvidence
      ? ` La preuve attendue pour cette tâche est précisément : "${expectedEvidence}".`
      : "";
    const result = await model.generateContent([
      {
        text: `Tu vérifies une preuve photo pour une app de défis personnels. La tâche déclarée est : "${taskLabel}".${evidenceLine} Réponds UNIQUEMENT avec un JSON strict de la forme {"verified": true|false, "reason": "courte explication en français"}. Sois indulgent mais refuse les photos évidemment sans rapport, vides, ou capture d'écran générique qui ne correspond pas à la preuve attendue.`,
      },
      { inlineData: { mimeType: mimeType ?? "image/jpeg", data: imageBase64 } },
    ]);

    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ verified: false, reason: "Réponse IA illisible." });

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ verified: !!parsed.verified, reason: parsed.reason ?? "" });
  } catch (err) {
    return NextResponse.json(
      { verified: false, reason: "Vérification indisponible, réessaie plus tard.", error: String(err) },
      { status: 200 }
    );
  }
}
