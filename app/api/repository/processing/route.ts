import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

const EXPRESS_API_URL = process.env.EXPRESS_API_URL;
if (!EXPRESS_API_URL) {
  throw new Error("EXPRESS_API_URL is required.");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const repositories = await prisma.repository.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
        userId: session.user.id,
      },
    });

    return Response.json({ repositories });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
    }

    return Response.json(
      { message: "Failed to fetch processing repositories" },
      { status: 500 }
    );
  }
}
