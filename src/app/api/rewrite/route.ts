import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, personality, tone } = body;

    if (!resume || typeof resume !== "string") {
      return NextResponse.json(
        { error: "Invalid resume data" },
        { status: 400 },
      );
    }

    const trimmedResume = resume.length > 4000 ? resume.slice(0, 4000) : resume;

    const interpretSlider = (
      val: number,
      low: string,
      high: string,
    ): string => {
      if (val < 0.33) return low;
      if (val > 0.66) return high;
      return `${low}-${high} blend`;
    };

    const personalitySummary = `
Personality Profile:
- Social Style: ${interpretSlider(personality.introverted, "Introverted", "Extroverted")}
- Risk Approach: ${interpretSlider(personality.cautious, "Cautious", "Bold")}
- Thinking Style: ${interpretSlider(personality.practical, "Practical", "Imaginative")}
- Decision Style: ${interpretSlider(personality.analytical, "Analytical", "Empathetic")}
`;

    const toneSummary = `
Narrative Style Preferences:
- Expressiveness: ${interpretSlider(tone.expressiveness, "Reserved", "Expressive")}
- Language: ${interpretSlider(tone.language, "Precise", "Conversational")}
- Structure: ${interpretSlider(tone.structure, "Structured", "Spontaneous")}
- Professionalism: ${interpretSlider(tone.professionalism, "Professional", "Playful")}
`;

    const prompt = `
You are a professional career storyteller. Your task is to rewrite a resume into a compelling first-person 3-act career narrative.

Use this structure:

ACT I — ORIGIN STORY
- Early roles, industries, and formative experiences
- Set the stage with motivation and early moves

ACT II — INFLECTION POINTS
- Strategic leaps, startup moments, growth pivots, promotions
- Showcase problem solving, achievements, and transformation

ACT III — STRATEGIC IMPACT
- Executive-level or systems-level accomplishments
- Recent high-leverage projects, leadership, and values in action

Tone rules:
${toneSummary}

Personality reference (use for depth, not imitation):
${personalitySummary}

Resume Data:
=====
${trimmedResume}
=====
Return only the 3 acts. Use first-person voice. Reference specific companies, titles, and results.`;

    const start = Date.now();
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    const duration = Date.now() - start;
    console.log(`[rewrite] GPT completed in ${duration}ms`);

    const result =
      completion.choices[0]?.message?.content?.trim() || "No result returned.";

    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[rewrite] Error:", message);
    return NextResponse.json(
      { error: "Rewrite failed", detail: message },
      { status: 500 },
    );
  }
}
