import type { Metadata } from "next";
import "./globals.css";
import "./accessibility.css";
import "./movement.css";

export const metadata: Metadata = {
  title: "MoveLingo — thoughtful plans, lively lessons",
  description: "Turn any English topic, objective or teaching sample into a clear lesson. Plan, adapt and teach with guided procedures and visual demonstrations.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
