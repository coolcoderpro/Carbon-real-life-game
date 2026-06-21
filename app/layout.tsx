import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "@/context/GameProvider";

export const metadata: Metadata = {
  title: "EcoGarden — Carbon Footprint Game",
  description:
    "Log your daily choices and watch them shape a living garden. Understand and reduce your carbon footprint, one action at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-emerald-50 via-lime-50 to-sky-50 text-emerald-950 antialiased">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
