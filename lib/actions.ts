"use server";

import { db } from "@/db";
import { users, codeExecutions, snippets, stars } from "@/db/schema";
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
