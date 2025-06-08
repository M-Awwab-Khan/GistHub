"use server";

import { db } from "@/db";
import {
  users,
  codeExecutions,
  snippets,
  stars,
  snippetComments,
} from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function getUserData() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const userData = await db
    .select()
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);

  console.log(userData);
  return userData[0] || null;
}

export async function getUserStats(clerkUserId: string) {
  // Get total executions
  const totalExecutionsResult = await db
    .select({ count: count() })
    .from(codeExecutions)
    .where(eq(codeExecutions.userId, clerkUserId));

  // Get executions in last 24 hours
  const last24HoursResult = await db
    .select({ count: count() })
    .from(codeExecutions)
    .where(
      sql`${codeExecutions.userId} = ${clerkUserId} AND ${codeExecutions.createdAt} > NOW() - INTERVAL '24 hours'`
    );

  // Get language stats
  const languageStatsResult = await db
    .select({
      language: codeExecutions.language,
      count: count(),
    })
    .from(codeExecutions)
    .where(eq(codeExecutions.userId, clerkUserId))
    .groupBy(codeExecutions.language)
    .orderBy(desc(count()));

  // Get most starred language
  const mostStarredLanguageResult = await db
    .select({
      language: snippets.language,
      starCount: count(stars.id),
    })
    .from(snippets)
    .leftJoin(stars, eq(stars.snippetId, snippets.id))
    .where(eq(snippets.userId, clerkUserId))
    .groupBy(snippets.language)
    .orderBy(desc(count(stars.id)))
    .limit(1);

  const languageStats = languageStatsResult.reduce((acc, curr) => {
    acc[curr.language] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  const languages = languageStatsResult.map((stat) => stat.language);
  const favoriteLanguage = languageStatsResult[0]?.language || "N/A";
  const mostStarredLanguage = mostStarredLanguageResult[0]?.language || "N/A";

  return {
    totalExecutions: totalExecutionsResult[0]?.count || 0,
    languagesCount: languages.length,
    languages,
    last24Hours: last24HoursResult[0]?.count || 0,
    favoriteLanguage,
    languageStats,
    mostStarredLanguage,
  };
}

export async function getUserExecutions(
  clerkUserId: string,
  limit: number = 10,
  offset: number = 0
) {
  const executions = await db
    .select()
    .from(codeExecutions)
    .where(eq(codeExecutions.userId, clerkUserId))
    .orderBy(desc(codeExecutions.createdAt))
    .limit(limit)
    .offset(offset);

  return executions;
}

export async function getStarredSnippets(clerkUserId: string) {
  const starredSnippets = await db
    .select({
      id: snippets.id,
      title: snippets.title,
      language: snippets.language,
      code: snippets.code,
      userName: snippets.userName,
      createdAt: snippets.createdAt,
    })
    .from(stars)
    .innerJoin(snippets, eq(stars.snippetId, snippets.id))
    .where(eq(stars.userId, clerkUserId))
    .orderBy(desc(stars.createdAt));

  return starredSnippets;
}

export async function getUserSnippets(clerkUserId: string) {
  const userSnippets = await db
    .select({
      id: snippets.id,
      title: snippets.title,
      language: snippets.language,
      code: snippets.code,
      userName: snippets.userName,
      createdAt: snippets.createdAt,
      updatedAt: snippets.updatedAt,
    })
    .from(snippets)
    .where(eq(snippets.userId, clerkUserId))
    .orderBy(desc(snippets.updatedAt));

  return userSnippets;
}

// Snippet operations
export async function createSnippet({
  title,
  language,
  code,
  userId,
  userName,
  isPublic = false,
}: {
  title: string;
  language: string;
  code: string;
  userId: string;
  userName: string;
  isPublic?: boolean;
}) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId || clerkUserId !== userId) {
    throw new Error("Unauthorized");
  }

  const [snippet] = await db
    .insert(snippets)
    .values({
      title,
      language,
      code,
      userId,
      userName,
      public: isPublic,
    })
    .returning({ id: snippets.id });

  return snippet.id;
}

export async function getSnippet(snippetId: string) {
  const snippet = await db
    .select()
    .from(snippets)
    .where(eq(snippets.id, snippetId))
    .limit(1);

  return snippet[0] || null;
}

export async function updateSnippet({
  snippetId,
  title,
  code,
}: {
  snippetId: string;
  title?: string;
  code?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // First check if the user owns this snippet
  const snippet = await getSnippet(snippetId);
  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found or unauthorized");
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (title !== undefined) {
    updateData.title = title;
  }

  if (code !== undefined) {
    updateData.code = code;
  }

  await db.update(snippets).set(updateData).where(eq(snippets.id, snippetId));

  return { success: true };
}

export async function updateSnippetTitle(snippetId: string, title: string) {
  return updateSnippet({ snippetId, title });
}

export async function updateSnippetCode(snippetId: string, code: string) {
  return updateSnippet({ snippetId, code });
}

// Star operations
export async function toggleStarSnippet(snippetId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if already starred
  const existingStar = await db
    .select()
    .from(stars)
    .where(
      sql`${stars.userId} = ${userId} AND ${stars.snippetId} = ${snippetId}`
    )
    .limit(1);

  if (existingStar.length > 0) {
    // Unstar - remove the star
    await db
      .delete(stars)
      .where(
        sql`${stars.userId} = ${userId} AND ${stars.snippetId} = ${snippetId}`
      );
    return { starred: false };
  } else {
    // Star - add the star
    await db.insert(stars).values({
      userId,
      snippetId,
    });
    return { starred: true };
  }
}

export async function getSnippetStarCount(snippetId: string) {
  const result = await db
    .select({ count: count() })
    .from(stars)
    .where(eq(stars.snippetId, snippetId));

  return result[0]?.count || 0;
}

export async function isSnippetStarred(snippetId: string) {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const result = await db
    .select()
    .from(stars)
    .where(
      sql`${stars.userId} = ${userId} AND ${stars.snippetId} = ${snippetId}`
    )
    .limit(1);

  return result.length > 0;
}

// Comment operations
export async function getSnippetComments(snippetId: string) {
  const comments = await db
    .select({
      id: snippetComments.id,
      snippetId: snippetComments.snippetId,
      userId: snippetComments.userId,
      userName: snippetComments.userName,
      content: snippetComments.content,
      createdAt: snippetComments.createdAt,
      updatedAt: snippetComments.updatedAt,
    })
    .from(snippetComments)
    .where(eq(snippetComments.snippetId, snippetId))
    .orderBy(desc(snippetComments.createdAt));

  return comments;
}

export async function addComment({
  snippetId,
  content,
}: {
  snippetId: string;
  content: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user data to get the user name
  const userData = await getUserData();
  if (!userData) {
    throw new Error("User not found");
  }

  // Verify snippet exists
  const snippet = await getSnippet(snippetId);
  if (!snippet) {
    throw new Error("Snippet not found");
  }

  const [comment] = await db
    .insert(snippetComments)
    .values({
      snippetId,
      userId,
      userName: userData.name,
      content,
    })
    .returning();

  return comment;
}

export async function deleteComment(commentId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // First check if the user owns this comment
  const comment = await db
    .select()
    .from(snippetComments)
    .where(eq(snippetComments.id, commentId))
    .limit(1);

  if (!comment[0] || comment[0].userId !== userId) {
    throw new Error("Comment not found or unauthorized");
  }

  await db.delete(snippetComments).where(eq(snippetComments.id, commentId));

  return { success: true };
}

export async function getSnippetWithAccess(snippetId: string) {
  const { userId } = await auth();

  const snippet = await db
    .select()
    .from(snippets)
    .where(eq(snippets.id, snippetId))
    .limit(1);

  if (!snippet[0]) {
    return null;
  }

  // If snippet is public, anyone can access it
  if (snippet[0].public) {
    return snippet[0];
  }

  // If snippet is private, only the author can access it
  if (!userId || snippet[0].userId !== userId) {
    throw new Error("Access denied: This snippet is private");
  }

  return snippet[0];
}

export async function toggleSnippetVisibility(snippetId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // First check if the user owns this snippet
  const snippet = await getSnippet(snippetId);
  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found or unauthorized");
  }

  // Toggle the public status
  const [updatedSnippet] = await db
    .update(snippets)
    .set({
      public: !snippet.public,
      updatedAt: new Date(),
    })
    .where(eq(snippets.id, snippetId))
    .returning({ public: snippets.public });

  return {
    isPublic: updatedSnippet.public,
    publicUrl: updatedSnippet.public
      ? `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/snippets/${snippetId}`
      : null,
  };
}
