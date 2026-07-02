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
import { useUserRepositories } from "@/features/repo/hooks/use-repos";
import { cn } from "@/lib/utils";
import { RepositoryStatus } from "@repo/shared";
import { GitFork, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Logo } from "./logo";

const navItems = [{ title: "New", url: "/dashboard", icon: Plus }];

const STATUS_BORDER_MAP: Record<RepositoryStatus, string> = {
  PENDING: "border border-yellow-400 border-2",
  PROCESSING: "border border-yellow-400 border-2",
  COMPLETED: "border border-green-400 border-2",
  FAILED: "border border-red-400 border-2",
} as const;

export function DashboardSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();

  const { data: repositories = [] } = useUserRepositories();

  const getButtonStyles = (isActive: boolean): string => {
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
                      className={cn(
                        getButtonStyles(isActive),
                        "border border-border/60"
                      )}
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
          <SidebarGroup className="border-t border-sidebar-border/40 pt-2 animate-in fade-in duration-700">
            <SidebarGroupContent className="mt-1">
              <SidebarMenu className="flex flex-col gap-1">
                {repositories.map((repo) => {
                  const targetUrl = `/repo/${repo.id}`;
                  const isActive = pathname === targetUrl;

                  return (
                    <SidebarMenuItem key={repo.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={getButtonStyles(isActive)}
                      >
                        <Link
                          href={targetUrl}
                          className="cursor-pointer flex items-center gap-2.5 w-full"
                        >
                          <Avatar
                            className={cn("h-6 w-6 shrink-0  transition-all")}
                          >
                            <AvatarImage
                              src={repo.avatar || undefined}
                              alt={`${repo.name} identity asset`}
                              className={cn(
                                "object-cover",
                                STATUS_BORDER_MAP[repo.status]
                              )}
                            />
                            <AvatarFallback className="rounded bg-background flex items-center justify-center text-muted-foreground">
                              <GitFork className="size-3 text-muted-foreground/60" />
                            </AvatarFallback>
                          </Avatar>

                          <span className="truncate text-sm font-medium tracking-tight">
                            {repo.name}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}

                {repositories.length === 0 && (
                  <div className="px-3 py-4 text-xs italic text-muted-foreground/40 font-sans tracking-wide select-none">
                    No repositories yet.
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
