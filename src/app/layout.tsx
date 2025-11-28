import type { Metadata } from "next";
import React from 'react';
import "./globals.css";
import {Toaster} from "@/components/shadcn/ui/sonner";


export const metadata: Metadata = {
  title: "气质猫咪",
  description: "气质猫咪的个人博客，练习时长两年半的ts全栈开发者",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="font-sans">
       {children}
       <Toaster/>
      </body>
    </html>
  );
}
