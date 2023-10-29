import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const todo = sqliteTable('todo', {
  id: integer('id').primaryKey(),
  title: text('title').unique().notNull(),
  description: text('description').notNull()
})

export type Todo = typeof todo.$inferSelect

