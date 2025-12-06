import "@/styles/globals.css";
import "@radix-ui/themes/styles.css";

import Link from "next/link";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { Button, Container, Flex, Theme } from "@radix-ui/themes";

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

/**
 * Root layout component.
 * Wraps the application with providers, theme, and global structure.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The content to render.
 * @returns {JSX.Element} The root HTML structure.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="antialiased">
        <Theme
          appearance="dark"
          accentColor="iris"
          radius="large"
          scaling="100%"
        >
          <TRPCReactProvider>
            <div className="flex min-h-screen flex-col">
              <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur">
                <Container size="3" px={{ initial: "4", sm: "6" }} py="3">
                  <Flex align="center" justify="between">
                    <Button variant="soft" color="gray" asChild size="2">
                      <Link href="/">← Back to Home</Link>
                    </Button>
                  </Flex>
                </Container>
              </header>
              <main className="flex-1">{children}</main>
            </div>
          </TRPCReactProvider>
        </Theme>
      </body>
    </html>
  );
}
