import React from "react";
import {TRPCReactProvider} from "@/components/trpc/client";

export default function AdminLayout({children}:{children: Readonly<React.ReactNode>}){
    return <TRPCReactProvider>
        {children}
    </TRPCReactProvider>
}