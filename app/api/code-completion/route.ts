// app/api/code-completion/route.ts
import { NextRequest, NextResponse } from "next/server";

import { CompletionCopilot, type CompletionRequestBody } from "monacopilot";

const copilot = new CompletionCopilot(undefined, {
  model: async (prompt) => {
    console.log(
      prompt.fileContent
        .replace(/\*\*Current code:\*\*\n```\n|\n```$/g, "")
        .replace("<|developer_cursor_is_here|>", "")
    );
    const response = await fetch(
      "https://codestral.mistral.ai/v1/fim/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "codestral-latest",
          prompt: prompt.fileContent
            .replace(/\*\*Current code:\*\*\n```\n|\n```$/g, "")
            .replace("<|developer_cursor_is_here|>", ""),
          temperature: 0.2,
          max_tokens: 256,
        }),
      }
    );

    const data = await response.json();

    return {
      text: data.choices[0].message.content,
    };
  },
});
console.log(process.env.MISTRAL_API_KEY, "MISTRAL_API_KEY");

export async function POST(req: NextRequest) {
  const body: CompletionRequestBody = await req.json();
  const completion = await copilot.complete({
    body,
  });

  return NextResponse.json(completion, { status: 200 });
}
