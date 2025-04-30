"use client";

import { MessageSquare } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export function Header() {
    return (
        <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm px-[1rem]">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">ReviewSense</h1>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Beta
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}