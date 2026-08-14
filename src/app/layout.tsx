import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rahul Ornob — Product Designer",
  description:
    "Designing for the web, building when needed, and using AI to move faster without letting it make the creative decisions.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
