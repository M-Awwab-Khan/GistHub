import {
  pgTable,
  text,
  boolean,
  integer,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(), // clerkId
    email: text("email").notNull(),
    name: text("name").notNull(),
    isPro: boolean("is_pro").notNull().default(false),
    proSince: integer("pro_since"), // timestamp as number (optional)
    lemonSqueezyCustomerId: text("lemon_squeezy_customer_id"),
    lemonSqueezyOrderId: text("lemon_squeezy_order_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("users_user_id_idx").on(table.userId),
  })
);

export const codeExecutions = pgTable(
  "code_executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    language: text("language").notNull(),
    code: text("code").notNull(),
    output: text("output"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("code_executions_user_id_idx").on(table.userId),
  })
);

export const snippets = pgTable(
  "snippets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    language: text("language").notNull(),
    code: text("code").notNull(),
    userName: text("user_name").notNull(), // store user's name for easy access
    public: boolean("public").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("snippets_user_id_idx").on(table.userId),
  })
);

export const snippetComments = pgTable(
  "snippet_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    snippetId: uuid("snippet_id")
      .notNull()
      .references(() => snippets.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    content: text("content").notNull(), // This will store HTML content
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    snippetIdIdx: index("snippet_comments_snippet_id_idx").on(table.snippetId),
  })
);

export const stars = pgTable(
  "stars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    snippetId: uuid("snippet_id")
      .notNull()
      .references(() => snippets.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("stars_user_id_idx").on(table.userId),
    snippetIdIdx: index("stars_snippet_id_idx").on(table.snippetId),
    userSnippetIdx: index("stars_user_id_snippet_id_idx").on(
      table.userId,
      table.snippetId
    ),
  })
);

export const snippetCollaborators = pgTable(
  "snippet_collaborators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    snippetId: uuid("snippet_id")
      .notNull()
      .references(() => snippets.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(), // Clerk user ID
    email: text("email").notNull(), // User email for easy identification
    name: text("name").notNull(), // User name for display
    addedBy: text("added_by").notNull(), // Who added this collaborator
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    snippetIdIdx: index("snippet_collaborators_snippet_id_idx").on(
      table.snippetId
    ),
    userIdIdx: index("snippet_collaborators_user_id_idx").on(table.userId),
    uniqueCollaborator: index("snippet_collaborators_unique_idx").on(
      table.snippetId,
      table.userId
    ),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  codeExecutions: many(codeExecutions),
  snippets: many(snippets),
  stars: many(stars),
}));

export const snippetsRelations = relations(snippets, ({ many }) => ({
  comments: many(snippetComments),
  stars: many(stars),
  collaborators: many(snippetCollaborators),
}));

export const snippetCommentsRelations = relations(
  snippetComments,
  ({ one }) => ({
    snippet: one(snippets, {
      fields: [snippetComments.snippetId],
      references: [snippets.id],
    }),
  })
);

export const starsRelations = relations(stars, ({ one }) => ({
  snippet: one(snippets, {
    fields: [stars.snippetId],
    references: [snippets.id],
  }),
}));

export const codeExecutionsRelations = relations(codeExecutions, ({ one }) => ({
  user: one(users, {
    fields: [codeExecutions.userId],
    references: [users.userId],
  }),
}));

export const snippetCollaboratorsRelations = relations(
  snippetCollaborators,
  ({ one }) => ({
    snippet: one(snippets, {
      fields: [snippetCollaborators.snippetId],
      references: [snippets.id],
    }),
  })
);
