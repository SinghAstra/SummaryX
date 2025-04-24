import { AvatarMenu } from "@/components/ui/avatar-menu";
import { buttonVariants } from "@/components/ui/button";
import SignIn from "@/components/ui/sign-in";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { User } from "next-auth";
import Link from "next/link";

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-dashed backdrop-blur-sm">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard">
          <span className="text-xl tracking-wider">{siteConfig.name}</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <Link
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
            href="/dashboard?action=connect"
          >
            <Plus className="h-5 w-5" />
            Connect New Repository
          </Link>
          {user ? <AvatarMenu user={user} /> : <SignIn />}
        </div>
      </div>
    </nav>
  );
}
