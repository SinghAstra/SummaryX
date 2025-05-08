import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createCleanJobsToken } from "@/lib/service-auth";
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

    const serviceToken = createCleanJobsToken({
      userId: session.user.id,
    });

    const response = await fetch(`${EXPRESS_API_URL}/api/clean/user-jobs`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
    });

    const data = await response.json();

    console.log("stopRepositoryProcessing data : ", data);

    await prisma.repository.updateMany({
      where: {
        userId: session.user.id,
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
      data: {
        status: "FAILED",
      },
    });

    return Response.json({ message: "Deleted all Processing Repositories" });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
    }

    return Response.json(
      { message: "Failed to stop processing repositories" },
      { status: 500 }
    );
  }
}
