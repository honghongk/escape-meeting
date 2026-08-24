import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "회의 탈출 확률",
  description: "이 회의, 언제 끝날까요?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
