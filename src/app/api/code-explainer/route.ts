import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  console.log("API Key Loaded?", process.env.OPENAI_API_KEY ? "YES" : "NO");

  try {
    const body = await req.json();
    const { code, language } = body;

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    const lang = language || "general programming";

    const prompt = `
You are an expert ${lang} software engineer.
Analyze the following ${lang} code and provide a structured response with two sections:

1. **Explanation**: Explain line by line in simple terms.
2. **Suggestions**: List bugs, inefficiencies, and possible improvements or refactorings.
3. **Refactored Code**: Provide an improved, cleaner version of the code if needed.

Return output in this exact format:

**EXPLANATION:**
<your explanation>

**SUGGESTIONS:**
<your suggestions>

**REFACTORED CODE:**
<your refactored code inside a code block>
    
Code:
\`\`\`${lang}
${code}
\`\`\`
`;

    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message?.content || "No response";

    return NextResponse.json({
      explanation: content,
    });
  } catch (error) {
    console.error("API ERROR:", error);

    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : "Unknown error";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


