import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

// This table stores the SMTP settings for each user
export const smtpSettings = pgTable("smtp_settings", {
  // We use the User ID from Clerk as the primary key
  userId: text("user_id").primaryKey(),
  
  host: text("host").notNull(),
  port: integer("port").notNull(),
  user: text("user").notNull(),
  
  // We will encrypt this password before saving it here
  password: text("password").notNull(),
  
  fromEmail: text("from_email").notNull(),
  
  // Useful to know when they last updated their settings
  updatedAt: timestamp("updated_at").defaultNow(),
});