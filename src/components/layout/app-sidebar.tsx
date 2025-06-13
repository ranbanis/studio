'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, BarChart2, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/shared/logo';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const iconMap: { [key: string]: React.ElementType } = {
  Home,
  PlusCircle,
  BarChart2,
  Settings,
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col p-4 border-r border-sidebar-border shadow-lg fixed">
      <div className="mb-8">
        <Logo className="text-sidebar-primary hover:text-sidebar-accent" />
      </div>
      <nav className="flex-grow space-y-2">
        {siteConfig.navItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <TooltipProvider key={item.label} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={item.href} legacyBehavior>
                    <a
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                      <span>{item.label}</span>
                    </a>
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
      {user && (
        <div className="mt-auto space-y-2">
           <div className="flex items-center space-x-2 p-2 border-t border-sidebar-border pt-4">
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || "User"} className="h-8 w-8 rounded-full" />
            )}
            <span className="text-sm text-sidebar-foreground truncate">{user.displayName || user.email}</span>
          </div>
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      )}
    </aside>
  );
}
