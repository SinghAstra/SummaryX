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
import { Skeleton } from "@/components/ui/skeleton";
import { siteConfig } from "@/config/site";
import { useDeleteRepository } from "@/features/repo/hooks/use-delete-repo";
import { useUserRepositories } from "@/features/repo/hooks/use-repos";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { RepositoryStatus } from "@repo/shared";
import { GitFork, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Logo } from "./logo";

const navItems = [{ title: "New", url: ROUTES.DASHBOARD, icon: Plus }];

export const STATUS_BORDER_MAP: Record<RepositoryStatus, string> = {
  PENDING: "border border-yellow-400 border-2",
  PROCESSING: "border border-yellow-400 border-2",
  COMPLETED: "border border-green-400 border-2",
  FAILED: "border border-red-400 border-2",
} as const;

export function DashboardSidebar() {
  const { state, isMobile, setOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { data: repositories = [], isLoading: isReposLoading } =
    useUserRepositories();
  const { mutateAsync: deleteRepo, isPending: isDeleting } =
    useDeleteRepository();

  const getButtonStyles = (isActive: boolean): string => {
    return cn(
      "!bg-transparent !text-muted-foreground transition-colors duration-200",
      "hover:!bg-sidebar-accent hover:!text-foreground",
      isActive && "!bg-sidebar-accent !text-foreground"
    );
  };

  const handleMobileNavigationClose = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  const handleDeleteExecution = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    toast.promise(deleteRepo(id), {
      loading: "Deleting Repository...",
    });

    if (pathname === `/repo/${id}`) {
      router.push(ROUTES.DASHBOARD);
    }
  };

  return (
    <Sidebar
      className="bg-sidebar border-r border-sidebar-border"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border flex flex-row items-center justify-between p-2 group-data-[collapsible=icon]:justify-center">
        {state === "expanded" ? (
          <>
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={handleMobileNavigationClose}
            >
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
                      <Link
                        href={item.url}
                        onClick={handleMobileNavigationClose}
                      >
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
              <SidebarMenu className="flex flex-col gap-0.5">
                {isReposLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <SidebarMenuItem key={index} className="w-full">
                      <div className="flex items-center gap-2.5 w-full p-2">
                        <Skeleton className="h-6 w-6 shrink-0 rounded bg-sidebar-accent/50" />
                        <Skeleton className="h-4 w-2/3 rounded bg-sidebar-accent/50" />
                      </div>
                    </SidebarMenuItem>
                  ))
                ) : repositories.length === 0 ? (
                  <div className="px-3 py-4 text-xs italic text-muted-foreground/40 font-sans tracking-wide select-none">
                    No repositories yet.
                  </div>
                ) : (
                  repositories.map((repo) => {
                    const targetUrl = `/repo/${repo.id}`;
                    const isActive = pathname === targetUrl;

                    return (
                      <SidebarMenuItem
                        key={repo.id}
                        className="group relative flex items-center w-full"
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={cn(
                            getButtonStyles(isActive),
                            "w-full pr-10"
                          )}
                        >
                          <Link
                            href={targetUrl}
                            onClick={handleMobileNavigationClose}
                            className="cursor-pointer flex items-center gap-2.5 w-full"
                          >
                            <Avatar className="h-6 w-6 shrink-0 transition-all">
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

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          <button
                            className="opacity-0 group-hover/menu-item:opacity-100 p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all duration-150 ease-in-out scale-95 group-hover/menu-item:scale-100 focus:opacity-100 cursor-pointer outline-none animate-in fade-in slide-in-from-right-1"
                            onClick={(e) => handleDeleteExecution(e, repo.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
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
