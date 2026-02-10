import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway", // Define the variable
});

export const metadata: Metadata = {
  title: "Sajilo Mailer",
  description: "A simple and efficient email sending service built with personalized templates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
    <body className={`${raleway.variable} font-sans`}>
      {children}
    </body>
  </html>
  </ClerkProvider>
  );
}
