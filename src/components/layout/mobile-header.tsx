
'use client';

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Logo } from "../shared/logo";

interface MobileHeaderProps {
    onToggleSidebar: () => void;
}

export function MobileHeader({ onToggleSidebar }: MobileHeaderProps) {
    return (
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
            <Logo className="text-2xl" />
        </header>
    );
}
