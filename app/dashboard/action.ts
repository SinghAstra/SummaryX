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

export async function wakeUpServer() {
  try {
    const EXPRESS_API_URL = process.env.EXPRESS_API_URL;
    const AWAKE_API_URL = process.env.AWAKE_API_URL;
    if (!EXPRESS_API_URL) {
      throw new Error("EXPRESS_API_URL is not defined");
    }
    if (!AWAKE_API_URL) {
      throw new Error("AWAKE_API_URL is not defined");
    }

    const response = await fetch(`${AWAKE_API_URL}/api/wake-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiURL: EXPRESS_API_URL }),
    });

    const data = await response.json();

    console.log("data is ", data);
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
  }
}
