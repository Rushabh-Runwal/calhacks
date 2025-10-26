import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talking Tom Chat",
  description: "Multiplayer AI chat with Talking Tom - voice to voice conversations!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
