import "@/styles/globals.css";
import "@radix-ui/themes/styles.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Theme } from "@radix-ui/themes";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Deadronos URL List",
  description: "Collect, share, and discover curated links.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="antialiased">
        <Theme appearance="dark" accentColor="iris" radius="large" scaling="100%">
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </Theme>
      </body>
    </html>
  );
}
