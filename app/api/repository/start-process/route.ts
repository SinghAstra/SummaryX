import { authOptions } from "@/lib/auth-options";
import { fetchGitHubRepoMetaData, parseGithubUrl } from "@/lib/github";
import { prisma } from "@/lib/prisma";
import { createServiceToken } from "@/lib/service-auth";
import { RepositoryStatus } from "@prisma/client";
import { getServerSession } from "next-auth";

const EXPRESS_API_URL = process.env.EXPRESS_API_URL;
if (!EXPRESS_API_URL) {
  throw new Error("EXPRESS_API_URL is required.");
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Get and validate input
    const body = await req.json();
    const { githubUrl } = body;

    if (!githubUrl) {
      return Response.json(
        { message: "GitHub URL is required" },
        { status: 400 }
      );
    }

    // 3. Parse and validate GitHub URL
    const urlInfo = parseGithubUrl(githubUrl);
    if (!urlInfo.isValid || !urlInfo.owner) {
      return Response.json(
        { message: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const { owner, repo } = urlInfo;

    // 4. Fetch repository MetaData from GitHub API
    const repoDetails = await fetchGitHubRepoMetaData(owner, repo);

    if (!repoDetails) {
      return Response.json(
        { message: "Repository does not exist or is private" },
        { status: 400 }
      );
    }

    console.log("session.user.id is ", session.user.id);

    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    console.log("user is ", user);

    // 5. Create new repository record
    const repository = await prisma.repository.create({
      data: {
        githubId: repoDetails.githubId,
        name: repoDetails.name,
        owner: repoDetails.owner,
        url: repoDetails.url,
        status: "PENDING",
        userId: session.user.id,
        avatarUrl: repoDetails.avatarUrl,
      },
    });

    const serviceToken = createServiceToken({
      repositoryId: repository.id,
      userId: session.user.id,
      githubUrl,
    });

    await fetch(`${EXPRESS_API_URL}/api/queue/repository`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
    });

    // 6. Fetch repository details and data
    return Response.json({
      repository: repository,
      status: RepositoryStatus.PENDING,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error message:", error.message);
      console.log("Error stack:", error.stack);
    }

    return Response.json(
      { message: "Failed to process repository" },
      { status: 500 }
    );
  }
}
