import { ZapIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./button";

export default function SignIn() {
  return (
    <div className="flex items-center gap-x-4">
      <Link
        href="/auth/sign-in"
        className={buttonVariants({ variant: "ghost" })}
      >
        Sign In
      </Link>
      <Link href="/auth/sign-in" className={buttonVariants({})}>
        Get Started
        <ZapIcon className="size-3.5 ml-1.5 text-orange-500 fill-orange-500" />
      </Link>
    </div>
  );
}
