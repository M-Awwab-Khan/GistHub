import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

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

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.userId, evt.data.id))
        .limit(1);

      if (existingUser.length === 0) {
        // Insert user only if they don't exist
        await db.insert(users).values({
          userId: evt.data.id,
          email: evt.data.email_addresses[0]?.email_address || "",
          name:
            `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() ||
            "Unknown",
          isPro: false,
        });
      }
    } else if (evt.type === "user.updated") {
      console.log("Updating user:", evt.data.id);

      await db
        .update(users)
        .set({
          email: evt.data.email_addresses[0]?.email_address || "",
          name:
            `${evt.data.first_name || ""} ${evt.data.last_name || ""}`.trim() ||
            "Unknown",
        })
        .where(eq(users.userId, evt.data.id));
    } else if (evt.type === "user.deleted") {
      console.log("Deleting user:", evt.data.id);

      await db.delete(users).where(eq(users.userId, evt.data.id || ""));
    }
    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
