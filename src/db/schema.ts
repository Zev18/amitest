import { generateSlug } from "@/lib/utils"
import { defineRelations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  serial,
  integer,
  unique,
} from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const quiz = pgTable("quizzes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  slug: text("slug")
    .notNull()
    .unique()
    .$defaultFn(() => generateSlug()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const quizSection = pgTable(
  "quiz_sections",
  {
    id: serial().primaryKey(),
    name: text(),
    order: integer().notNull(),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [unique().on(table.quizId, table.order)]
)

export const quizQuestion = pgTable(
  "quiz_questions",
  {
    id: serial().primaryKey(),
    label: text(),
    order: integer().notNull(),
    sectionId: integer("section_id")
      .notNull()
      .references(() => quizSection.id, { onDelete: "cascade" }),
    points: integer().notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [unique().on(table.sectionId, table.order)]
)

export const quizResponse = pgTable("quiz_responses", {
  id: serial().primaryKey(),
  name: text(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const questionResponse = pgTable("question_responses", {
  id: serial().primaryKey(),
  quizResponseId: integer("quiz_response_id")
    .references(() => quizResponse.id, { onDelete: "cascade" })
    .notNull(),
  response: boolean().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const relations = defineRelations(
  {
    user,
    session,
    account,
    verification,
    quiz,
    quizSection,
    quizQuestion,
    quizResponse,
    questionResponse,
  },
  (r) => ({
    user: {
      sessions: r.many.session({
        from: r.user.id,
        to: r.session.userId,
      }),
      accounts: r.many.account({
        from: r.user.id,
        to: r.account.userId,
      }),
      quizzes: r.many.quiz({
        from: r.user.id,
        to: r.quiz.authorId,
      }),
      quizResponses: r.many.quizResponse({
        from: r.user.id,
        to: r.quizResponse.userId,
      }),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },
    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },
    quiz: {
      author: r.one.user({
        from: r.quiz.authorId,
        to: r.user.id,
      }),
      sections: r.many.quizSection({
        from: r.quiz.id,
        to: r.quizSection.quizId,
      }),
    },
    quizSection: {
      quiz: r.one.quiz({
        from: r.quizSection.quizId,
        to: r.quiz.id,
      }),
      questions: r.many.quizQuestion({
        from: r.quizSection.id,
        to: r.quizQuestion.sectionId,
      }),
    },
    quizQuestion: {
      section: r.one.quizSection({
        from: r.quizQuestion.sectionId,
        to: r.quizSection.id,
      }),
    },
    quizResponse: {
      user: r.one.user({
        from: r.quizResponse.userId,
        to: r.user.id,
      }),
      questionResponses: r.many.questionResponse({
        from: r.quizResponse.id,
        to: r.questionResponse.quizResponseId,
      }),
    },
    questionResponse: {
      quizResponse: r.one.quizResponse({
        from: r.questionResponse.quizResponseId,
        to: r.quizResponse.id,
      }),
    },
  })
)
