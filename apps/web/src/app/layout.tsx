import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "ZIN",
  description: "AI-powered second brain"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
