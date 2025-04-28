import FadeSlideIn from "@/components/global/fade-slide-in";
import Footer from "@/components/home/footer";
import Navbar from "@/components/home/navbar";
import { buttonVariants } from "@/components/ui/button";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function NotFound() {
  const session = await getServerSession(authOptions);

  const href = session ? "/dashboard" : "/";
  return (
    <div className="relative z-0 min-h-screen  flex flex-col">
      <div className="absolute top-0 inset-x-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] h-[100vh] z-[-1]" />
      <Navbar user={session?.user} />
      <div className=" flex-1 flex flex-col gap-4 items-center justify-center">
        <FadeSlideIn delay={0.1}>
          <div className="text-center flex flex-col items-center justify-center w-fit gap-2">
            <h2 className="text-7xl font-bold pr-1">404</h2>
            <p className="text-muted-foreground text-md font-medium">
              Page not found {":("}
            </p>
            <p>Oops! The page you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </FadeSlideIn>
        <FadeSlideIn delay={0.3}>
          <Link href={href} className={buttonVariants({})}>
            Back to homepage
          </Link>
        </FadeSlideIn>
      </div>
      <Footer />
    </div>
  );
}