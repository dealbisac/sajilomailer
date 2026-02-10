'use server'

import { db } from "@/lib/db";
import { smtpSettings } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";

// Simple encryption helper (in a real app, use a proper library like 'crypto-js')
// For now, we will store it as is to get it working, then secure it.
function encrypt(text: string) { return text; } 

export async function saveSettings(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Not authorized");

  const host = formData.get("host") as string;
  const userEmail = formData.get("user") as string;
  const pass = formData.get("pass") as string;
  const fromEmail = formData.get("from") as string;
  const port = parseInt(formData.get("port") as string);

  await db.insert(smtpSettings).values({
    userId: user.id,
    host,
    port,
    user: userEmail,
    password: encrypt(pass),
    fromEmail
  }).onConflictDoUpdate({
    target: smtpSettings.userId,
    set: { host, port, user: userEmail, password: encrypt(pass), fromEmail, updatedAt: new Date() }
  });

  revalidatePath("/");
  return { success: true };
}


// 1. Helper to replace %variable% with actual data
function replaceVariables(template: string, data: Record<string, string>) {
    return template.replace(/%(\w+)%/g, (_, key) => data[key] || "");
}

// Defined return type for clarity (New addition for Analytics)
type SendResult = {
  email: string;
  status: 'success' | 'failed';
  error?: string;
};
  
// 2. The Bulk Send Action (Updated for Detailed Analytics)
export async function sendBulkEmails(
  recipients: Record<string, string>[], 
  subjectTemplate: string, 
  bodyTemplate: string
): Promise<SendResult[]> {
  
  const user = await currentUser();
  if (!user) throw new Error("Not authorized");

  // A. Fetch User's SMTP Settings
  const settings = await db.query.smtpSettings.findFirst({
    where: eq(smtpSettings.userId, user.id)
  });

  if (!settings) throw new Error("Please configure SMTP settings first!");

  // B. Initialize Nodemailer
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465, // True for port 465, false for others
    auth: {
      user: settings.user,
      pass: settings.password, // Decrypt this if you used encryption!
    },
  });

  // C. Loop and Send
  const results: SendResult[] = [];

  for (const recipient of recipients) {
    try {
      // Personalize the content
      const personalizedBody = replaceVariables(bodyTemplate, recipient);
      const personalizedSubject = replaceVariables(subjectTemplate, recipient);

      await transporter.sendMail({
        from: settings.fromEmail,
        to: recipient.email, // Ensure your CSV has an "email" column!
        subject: personalizedSubject,
        html: personalizedBody,
      });
      
      // Log success
      results.push({ email: recipient.email, status: 'success' });
      
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`Failed to send to ${recipient.email}:`, error);
      
      // Log failure with specific error message
      results.push({ 
        email: recipient.email, 
        status: 'failed', 
        error: error.message || 'Unknown error' 
      });
    }
  }

  return results;
}