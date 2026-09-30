import type { Metadata, Viewport } from "next";
import { Chakra_Petch, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const texto = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-texto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enzo Seiji Delgado Tabuchi",
  description:
    "Desenvolvedor back-end (Node.js, NestJS, TypeScript) e estudante de Ciência da Computação na FIAP, interessado em robótica e automação.",
  openGraph: {
    title: "Enzo Seiji Delgado Tabuchi",
    description: "Back-end, robótica e automação. São Paulo.",
    type: "profile",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E4E8EC" },
    { media: "(prefers-color-scheme: dark)", color: "#131922" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${texto.variable}`}>
      <body>{children}</body>
    </html>
  );
}
