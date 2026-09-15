import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Anton } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Maidan — India's college competition arena",
    template: "%s | Maidan",
  },
  description:
    "Maidan is India's college competition arena. Build a squad, enter challenges, and earn your place on the leaderboard.",
  applicationName: "Maidan",
  authors: [{ name: "Maidan" }],
  creator: "Maidan",
  publisher: "Maidan",
  category: "College competitions",
  keywords: ["college competitions", "college squads", "student challenges", "Indian colleges", "Maidan"],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Maidan — India's college competition arena",
    description: "Build a squad, enter challenges, and earn your place on the leaderboard.",
    type: "website",
    locale: "en_IN",
    siteName: "Maidan",
    images: [{ url: "/images/maidan-hero-campus.png", width: 1680, height: 944, alt: "College students entering a maidan at dusk" }],
  },
  twitter: { card: "summary_large_image", title: "Maidan — India's college competition arena", description: "Build a squad, enter challenges, and earn your place on the leaderboard.", images: ["/images/maidan-hero-campus.png"] },
};

export const viewport: Viewport = {
  themeColor: "#0d0f1f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${anton.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={150}>
          {children}
          <Toaster richColors position="top-center" theme="dark" />
        </TooltipProvider>
      </body>
    </html>
  );
}
