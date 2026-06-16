import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import AchievementToastManager from "@/components/ui/AchievementToastManager";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarbonVerse — Rewrite Your Future",
  description:
    "An interactive story where every choice shapes your planet's future",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      style={{ overflow: "hidden", height: "100%" }}
    >
      <body
        className="h-full overflow-hidden"
        style={{ background: "var(--cv-cream)" }}
      >
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <AchievementToastManager />
      </body>
    </html>
  );
}

