import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "@/db/index";
import { users } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    if (evt.type === "user.created") {
      console.log("userId:", evt.data.id);
      console.log("user", evt.data);
      // Example: Insert user into your database
      await db.insert(users).values({
        userId: evt.data.id,
        email: evt.data.email_addresses[0]?.email_address || "",
        name:
          `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() ||
          "Unknown",
        isPro: false,
      });
    }
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
