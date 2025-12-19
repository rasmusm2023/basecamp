import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../contexts/ThemeContext";
import { AuthProvider } from "../contexts/AuthContext";
import { SpacesProvider } from "../contexts/SpacesContext";
import ThemeScript from "../components/ThemeScript";
import Header from "../components/Header";
import ContentWrapper from "../components/ContentWrapper";

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
      <body
        className={`${inter.variable} font-sans antialiased overscroll-none`}
      >
        <ThemeScript />
        <AuthProvider>
          <SpacesProvider>
            <ThemeProvider>
              <div className="flex flex-col min-h-screen">
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[2560px] px-[36px] py-[16px]">
                    <Header />
                  </div>
                </div>
                <div className="w-full flex justify-center">
                  <div className="w-full max-w-[2560px]">
                    <ContentWrapper>{children}</ContentWrapper>
                  </div>
                </div>
              </div>
            </ThemeProvider>
          </SpacesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
