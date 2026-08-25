import type { Metadata } from "next";
import { AuthModalProvider } from "@/components/AuthModalProvider";
import MobileTabBar from "@/components/MobileTabBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "yumview | 서울 맛집 검색",
  description: "서울 맛집을 검색하고 담아두는 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ ["--font-pretendard" as string]: "'PretendardVariable'" }}
      >
        <AuthModalProvider>
          {children}
          <MobileTabBar />
        </AuthModalProvider>
      </body>
    </html>
  );
}
