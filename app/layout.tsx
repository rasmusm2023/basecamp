import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import ThemeScript from "../components/ThemeScript";
import Header from "../components/Header";
import PageTransition from "../components/PageTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Basecamp.space - Manage all your links in one space",
  description: "Manage all your links in one space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overscroll-none">
      <body className={`${inter.variable} font-sans antialiased overscroll-none`}>
        <ThemeScript />
        <AuthProvider>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <div className="w-full px-[36px] py-[16px] flex justify-center">
                <Header />
              </div>
              <div className="mt-[100px]">
                <PageTransition>{children}</PageTransition>
              </div>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

