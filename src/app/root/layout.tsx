import React from 'react'
import {ThemeProvider} from "@/components/shadcn/theme-provider";
import { Navbar } from "@/components/root/navbar"
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
            {children}
            <MusicPlayer />
        </ThemeProvider>
    )
}
