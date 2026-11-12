import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Portal Dex", template: "%s · Portal Dex" },
  description:
    "Browse every Rick and Morty character as a collectible card. Unofficial fan project.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1280px] flex-1 px-4 focus:outline-none sm:px-6 lg:px-8"
        >
          {children}
        </main>
      </body>
    </html>
  );
}
