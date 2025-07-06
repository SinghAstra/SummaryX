import NotFound from "@/components/not-found";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";

async function NotFoundPage() {
  const session = await getServerSession(authOptions);

  return <NotFound user={session?.user} />;
}

export default NotFoundPage;
