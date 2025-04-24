"use server";

import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createCleanJobsToken } from "@/lib/service-auth";
import { getServerSession } from "next-auth";

const EXPRESS_API_URL = process.env.EXPRESS_API_URl;

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

export async function activateBackendServer() {
  try {
    if (!EXPRESS_API_URL) {
      throw new Error("EXPRESS_API_URL is required.");
    }
    const response = await fetch(EXPRESS_API_URL);
    const data = await response.json();
    console.log("activateBackendServer data:", data);
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
  }
}

export async function fetchProcessingRepository() {
  try {
    const response = await prisma.repository.findMany({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    });
    console.log("response is ", response);

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
    return [];
  }
}

export async function stopRepositoryProcessing() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return;
    }

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

    const serviceToken = createCleanJobsToken({
      userId: session.user.id,
    });

    const response = await fetch(`${EXPRESS_API_URL}/api/clean/jobs`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
    });

    const data = await response.json();

    console.log("stopRepositoryProcessing data : ", data);
  } catch (error) {
    if (error instanceof Error) {
      console.log("error.stack is ", error.stack);
      console.log("error.message is ", error.message);
    }
  }
}
