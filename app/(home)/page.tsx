import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import HeroSection from "./hero";

const HomePage = async () => {
  const session = await getServerSession(authOptions);
  const isAuthenticated = session ? true : false;

  return <HeroSection isAuthenticated={isAuthenticated} />;
};

export default HomePage;
