"use server";

import { db } from "@/db";
import {
  users,
  codeExecutions,
  snippets,
  stars,
  snippetComments,
  snippetCollaborators,
} from "@/db/schema";
import { eq, desc, count, sql, or, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
      language: snippets.language,
      count: count(),
    })
    .from(snippets)
    .where(eq(snippets.userId, clerkUserId))
    .groupBy(snippets.language)
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

// Save code execution result to the database
export async function saveCodeExecution({
  language,
  code,
  output,
  error,
}: {
  language: string;
  code: string;
  output?: string | null;
  error?: string | null;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [execution] = await db
    .insert(codeExecutions)
    .values({
      userId,
      language,
      code,
      output: output || null,
      error: error || null,
    })
    .returning();

  return execution;
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

  revalidatePath(`/snippets/${snippetId}`);

  return {
    isPublic: updatedSnippet.public,
    publicUrl: updatedSnippet.public
      ? `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/snippets/${snippetId}`
      : null,
  };
}

export async function getPublicSnippets({
  page = 1,
  limit = 12,
  search = "",
  language = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
} = {}) {
  const offset = (page - 1) * limit;

  // Build where conditions
  let whereConditions = [eq(snippets.public, true)];

  if (search && language) {
    whereConditions.push(
      eq(snippets.language, language),
      or(
        sql`LOWER(${snippets.title}) LIKE LOWER(${`%${search}%`})`,
        sql`LOWER(${snippets.language}) LIKE LOWER(${`%${search}%`})`,
        sql`LOWER(${snippets.userName}) LIKE LOWER(${`%${search}%`})`
      )
    );
  } else if (search) {
    whereConditions.push(
      or(
        sql`LOWER(${snippets.title}) LIKE LOWER(${`%${search}%`})`,
        sql`LOWER(${snippets.language}) LIKE LOWER(${`%${search}%`})`,
        sql`LOWER(${snippets.userName}) LIKE LOWER(${`%${search}%`})`
      )
    );
  } else if (language) {
    whereConditions.push(eq(snippets.language, language));
  }

  const results = await db
    .select({
      id: snippets.id,
      title: snippets.title,
      language: snippets.language,
      code: snippets.code,
      userName: snippets.userName,
      userId: snippets.userId,
      public: snippets.public,
      createdAt: snippets.createdAt,
      updatedAt: snippets.updatedAt,
    })
    .from(snippets)
    .where(and(...whereConditions))
    .orderBy(desc(snippets.createdAt))
    .limit(limit)
    .offset(offset);

  // Get total count for pagination with same conditions
  const totalCountResult = await db
    .select({ count: count() })
    .from(snippets)
    .where(and(...whereConditions));

  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return {
    snippets: results,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getAvailableLanguages() {
  const result = await db
    .selectDistinct({ language: snippets.language })
    .from(snippets)
    .where(eq(snippets.public, true))
    .orderBy(snippets.language);

  return result.map((row) => row.language);
}

export async function deleteSnippet(snippetId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // First check if the user owns this snippet
  const snippet = await getSnippet(snippetId);
  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found or unauthorized");
  }

  // Delete the snippet (this will cascade delete comments and stars)
  await db.delete(snippets).where(eq(snippets.id, snippetId));

  return { success: true };
}

// Collaborator management functions
export async function addCollaborator(snippetId: string, email: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user owns this snippet
  const snippet = await getSnippet(snippetId);
  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found or unauthorized");
  }

  // Find user by email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user[0]) {
    throw new Error("User not found with this email");
  }

  // Check if user is already a collaborator
  const existingCollaborator = await db
    .select()
    .from(snippetCollaborators)
    .where(
      and(
        eq(snippetCollaborators.snippetId, snippetId),
        eq(snippetCollaborators.userId, user[0].userId)
      )
    )
    .limit(1);

  if (existingCollaborator.length > 0) {
    throw new Error("User is already a collaborator");
  }

  // Don't allow owner to add themselves
  if (user[0].userId === snippet.userId) {
    throw new Error("Cannot add snippet owner as collaborator");
  }

  // Add collaborator
  await db.insert(snippetCollaborators).values({
    snippetId,
    userId: user[0].userId,
    email: user[0].email,
    name: user[0].name,
    addedBy: userId,
  });

  revalidatePath(`/snippets/${snippetId}/edit`);

  return { success: true, collaborator: user[0] };
}

export async function removeCollaborator(
  snippetId: string,
  collaboratorUserId: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user owns this snippet
  const snippet = await getSnippet(snippetId);
  if (!snippet || snippet.userId !== userId) {
    throw new Error("Snippet not found or unauthorized");
  }

  // Remove collaborator
  await db
    .delete(snippetCollaborators)
    .where(
      and(
        eq(snippetCollaborators.snippetId, snippetId),
        eq(snippetCollaborators.userId, collaboratorUserId)
      )
    );

  revalidatePath(`/snippets/${snippetId}/edit`);

  return { success: true };
}

export async function getSnippetCollaborators(snippetId: string) {
  const collaborators = await db
    .select({
      id: snippetCollaborators.id,
      snippetId: snippetCollaborators.snippetId,
      userId: snippetCollaborators.userId,
      email: snippetCollaborators.email,
      name: snippetCollaborators.name,
      addedBy: snippetCollaborators.addedBy,
      createdAt: snippetCollaborators.createdAt,
    })
    .from(snippetCollaborators)
    .where(eq(snippetCollaborators.snippetId, snippetId))
    .orderBy(desc(snippetCollaborators.createdAt));

  return collaborators;
}

export async function checkSnippetEditPermission(snippetId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { canEdit: false, isOwner: false };
  }

  const snippet = await getSnippet(snippetId);
  if (!snippet) {
    return { canEdit: false, isOwner: false };
  }

  const isOwner = snippet.userId === userId;

  // Check if user is a collaborator
  const collaborator = await db
    .select()
    .from(snippetCollaborators)
    .where(
      and(
        eq(snippetCollaborators.snippetId, snippetId),
        eq(snippetCollaborators.userId, userId)
      )
    )
    .limit(1);

  const isCollaborator = collaborator.length > 0;
  const canEdit = isOwner || isCollaborator;

  return { canEdit, isOwner, isCollaborator };
}

// Update the existing getSnippet function to include collaborators
export async function getSnippetWithCollaborators(snippetId: string) {
  const snippet = await getSnippet(snippetId);
  if (!snippet) {
    return null;
  }

  const collaborators = await getSnippetCollaborators(snippetId);

  return {
    ...snippet,
    collaborators,
  };
}

// Update snippet functions to check for edit permissions
export async function updateSnippetWithCollaboratorCheck({
  snippetId,
  title,
  code,
}: {
  snippetId: string;
  title?: string;
  code?: string;
}) {
  const { canEdit } = await checkSnippetEditPermission(snippetId);

  if (!canEdit) {
    throw new Error("You don't have permission to edit this snippet");
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
  revalidatePath(`/snippets/${snippetId}/edit`);

  return { success: true };
}

export async function updateSnippetTitleWithCollaboratorCheck(
  snippetId: string,
  title: string
) {
  return updateSnippetWithCollaboratorCheck({ snippetId, title });
}

export async function updateSnippetCodeWithCollaboratorCheck(
  snippetId: string,
  code: string
) {
  return updateSnippetWithCollaboratorCheck({ snippetId, code });
}
