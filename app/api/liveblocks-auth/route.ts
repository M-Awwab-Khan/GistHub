import { auth, clerkClient } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Authenticating your Liveblocks application
 * https://liveblocks.io/docs/authentication
 */

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

// Generate a random color for the user
function generateUserColor(): string {
  const colors = [
    "#D583F0",
    "#F08385",
    "#F0D885",
    "#85EED6",
    "#85BBF0",
    "#8594F0",
    "#85DBF0",
    "#87EE85",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export async function POST(request: NextRequest) {
  try {
    // Get the current user's unique id from Clerk
    const { userId } = await auth();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Get user data from database
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!userData[0]) {
      return new Response("User not found", { status: 404 });
    }

    // Get user profile picture from Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    // Create a session for the current user
    // userInfo is made available in Liveblocks presence hooks, e.g. useOthers
    const session = liveblocks.prepareSession(`user-${userId}`, {
      userInfo: {
        name: userData[0].name,
        color: generateUserColor(),
        picture:
          clerkUser.imageUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData[0].name
          )}&background=random`,
      },
    });

    // Use a naming pattern to allow access to rooms with a wildcard
    session.allow(`*`, session.FULL_ACCESS);

    // Authorize the user and return the result
    const { body, status } = await session.authorize();
    return new Response(body, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
