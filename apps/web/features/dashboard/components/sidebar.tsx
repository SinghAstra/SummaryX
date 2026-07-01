"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { siteConfig } from "@/config/site";
import { useTodosQuery } from "@/features/todo/hooks/use-todos-query";
import { cn } from "@/lib/utils";
import { Loader2, Pickaxe, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const navItems = [
  { title: "New", url: "/dashboard", icon: Plus },
  { title: "Jobs", url: "/jobs", icon: Pickaxe },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();

  const { data, isLoading } = useTodosQuery();
  const todos = data?.todos ?? [];

  const getButtonStyles = (isActive: boolean) => {
    return cn(
      "!bg-transparent !text-muted-foreground transition-colors duration-200",
      "hover:!bg-sidebar-accent hover:!text-foreground",
      isActive && "!bg-sidebar-accent !text-foreground"
    );
  };

  return (
    <Sidebar
      className="bg-sidebar border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border flex flex-row items-center justify-between p-2 group-data-[collapsible=icon]:justify-center">
        {state === "expanded" ? (
          <>
            <Link href="/" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-background">
                <Logo size={20} className="text-foreground" />
              </div>
              <span className="text-sidebar-foreground font-semibold">
                {siteConfig.name}
              </span>
            </Link>
            <SidebarTrigger className="ml-auto" />
          </>
        ) : (
          <div className="group/toggle relative flex size-8 items-center justify-center">
            <SidebarTrigger className="size-full absolute inset-0 [>&_svg]:size-4" />
            <div className="absolute p-1.5 rounded-lg bg-sidebar pointer-events-none transition-opacity duration-200 group-hover/toggle:opacity-0 flex items-center justify-center backface-hidden">
              <Logo size={20} className="text-foreground" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="animate-in fade-in duration-400">
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={getButtonStyles(isActive)}
                    >
                      <Link href={item.url}>
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {state === "expanded" && (
          <SidebarGroup className="mt-1 border-t border-sidebar-border/40 pt-2 animate-in fade-in duration-800">
            <span className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Active Tasks
            </span>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-1">
                {isLoading ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    <span>Loading tasks...</span>
                  </div>
                ) : todos.length === 0 ? (
                  <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                    No active tasks
                  </div>
                ) : (
                  todos.map((todo, index) => {
                    const targetUrl = `/sample/${todo.id}`;
                    const isActive = pathname === targetUrl;

                    return (
                      <SidebarMenuItem key={todo.id}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={getButtonStyles(isActive)}
                        >
                          <Link href={targetUrl} className="cursor-pointer">
                            <Avatar className="h-6 w-6 shrink-0 rounded-full">
                              <AvatarImage src="/user.jpg" alt={todo.title} />
                              <AvatarFallback className="text-[10px] bg-muted font-medium text-muted-foreground">
                                {index + 1}
                              </AvatarFallback>
                            </Avatar>

                            <span className="truncate text-sm">
                              {todo.title}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
