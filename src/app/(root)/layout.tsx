import React from 'react'
import {ThemeProvider} from "@/components/shadcn/theme-provider";
import { Navbar } from "@/components/root/navbar"
import { Footer } from "@/components/root/footer"
import { MusicPlayer } from "@/components/root/music-player/music-player"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
            themes={["light", "dark"]}  
        >
            <Navbar />
            <div className="min-h-[calc(100vh-400px)]">
                {children}
            </div>
            <Footer />
            <MusicPlayer />
        </ThemeProvider>
    )
}
