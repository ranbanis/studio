
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, BarChart2, Settings, X } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '../ui/button';

const iconMap: { [key: string]: React.ElementType } = {
  Home,
  PlusCircle,
  BarChart2,
  Settings,
};

interface AppSidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isMobile, isOpen, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  
  const content = (
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-8 flex justify-between items-center">
            <Logo className="text-sidebar-primary hover:text-sidebar-accent" />
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={onToggle}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close sidebar</span>
              </Button>
            )}
        </div>
        <nav className="flex-grow space-y-2 px-4">
          {siteConfig.navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <TooltipProvider key={item.label} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={isMobile ? onToggle : undefined}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </div>
  );

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-30 bg-black/50 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onToggle}
        />
        <aside
          className={cn(
            "fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4 border-r border-sidebar-border shadow-lg z-40 transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {content}
        </aside>
      </>
    );
  }

  return (
    <aside className="h-screen w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border shadow-lg fixed hidden md:flex">
      {content}
    </aside>
  );
}
