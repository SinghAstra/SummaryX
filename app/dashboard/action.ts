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

export async function waitForWakeUp() {
  const MAX_RETRIES = 10;

  if (process.env.ENV === "development") {
    return;
  }

  for (let i = 0; i < MAX_RETRIES; i++) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/wake-up`
    );
    const data = await response.json();

    console.log("In waitForWakeUp, data is ", data);
    if (data.isActive) return;
    await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds
  }
}
