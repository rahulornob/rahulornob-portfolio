import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rahulornob.com"),
  title: "Rahul Ornob — Design Engineer",
  description:
    "Visual-first Design Engineer focused on websites, interfaces, and AI-assisted workflows that move ideas closer to something real.",
  openGraph: {
    title: "Rahul Ornob — Design Engineer",
    description:
      "Visual-first Design Engineer focused on websites, interfaces, and AI-assisted workflows that move ideas closer to something real.",
    url: "https://rahulornob.com",
    siteName: "Rahul Ornob",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rahul Ornob — Design Engineer",
    description:
      "Visual-first Design Engineer focused on websites, interfaces, and AI-assisted workflows that move ideas closer to something real.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
