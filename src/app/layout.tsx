import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway", // Define the variable
});

export const metadata: Metadata = {
  title: "Sajilo Mailer",
  description: "A simple and efficient email sending service built with Next.js and TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body className={`${raleway.variable} font-sans`}>
      {children}
    </body>
  </html>
  );
}
