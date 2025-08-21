import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css';
import {Web3Provider} from "../providers/web3-provider";
import { Toaster } from "sonner";
import Navbar from "../components/layout/Navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CortiGPT - Verifiable Multi-Agent AI for Web3",
  description: "CortiGPT unites multiple specialized AI agents on the Cortensor protocol, delivering trustless, verifiable intelligence with receipts you can prove.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Web3Provider>
          <TooltipProvider>
            <Navbar />
            <div className="pt-20">
              {children}
            </div>
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="dark"
            />
          </TooltipProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
