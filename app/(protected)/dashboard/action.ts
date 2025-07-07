"use server";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function fetchRepositories() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { message: "Authentication required", repositories: [] };
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { repositories };
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
    return { message: "Failed to Fetch Repositories", repositories: [] };
  }
}
