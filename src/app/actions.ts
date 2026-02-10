'use server'

import { db } from "@/lib/db";
import { smtpSettings } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
// import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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