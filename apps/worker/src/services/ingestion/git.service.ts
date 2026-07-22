import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function syncWorkspace(
  workspacePath: string,
  githubUrl: string,
  isResync: boolean
): Promise<void> {
  if (isResync) {
    await execAsync(`git fetch --depth 1 && git reset --hard FETCH_HEAD`, {
      cwd: workspacePath,
      timeout: 60000,
    });
  } else {
    await fs.mkdir(path.dirname(workspacePath), { recursive: true });

    await fs.rm(workspacePath, { recursive: true, force: true });

    await execAsync(`git clone --depth 1 ${githubUrl} ${workspacePath}`, {
      timeout: 60000,
    });
  }
}
