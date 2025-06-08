// app/api/code-completion/route.ts
import { NextRequest, NextResponse } from "next/server";

import { CompletionCopilot, type CompletionRequestBody } from "monacopilot";

const copilot = new CompletionCopilot(process.env.MISTRAL_API_KEY, {
  provider: "mistral",
  model: "codestral",
});
console.log(process.env.MISTRAL_API_KEY, "MISTRAL_API_KEY");

export async function POST(req: NextRequest) {
  const body: CompletionRequestBody = await req.json();
  const completion = await copilot.complete({
    body,
  });

  return NextResponse.json(completion, { status: 200 });
}
