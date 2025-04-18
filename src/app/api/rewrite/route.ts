import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { resume, personality, tone } = await req.json();

  const interpretSlider = (val: number, low: string, high: string): string => {
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
${resume}
=====
Return only the 3 acts. Use first-person voice. Reference specific companies, titles, and results.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // fixed since tone is now controlled by prompt
    });

    const result =
      completion.choices[0]?.message?.content?.trim() || "No result returned.";
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error generating rewrite:", error);
    return NextResponse.json(
      { result: "Sorry, something went wrong." },
      { status: 500 },
    );
  }
}
