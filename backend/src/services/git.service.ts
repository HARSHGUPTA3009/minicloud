import simpleGit from "simple-git";
import * as fs from "fs";
import * as path from "path";
import { config } from "../config";
import type { LogEntry } from "@minicloud/shared";

export async function cloneRepo(
  repoUrl: string,
  branch: string,
  commitSha: string,
  buildId: string,
  onLog: (l: LogEntry) => void
): Promise<string> {
  const buildPath = path.join(config.buildCachePath, String(buildId));

  if (fs.existsSync(buildPath)) {
    fs.rmSync(buildPath, { recursive: true, force: true });
  }

  fs.mkdirSync(buildPath, { recursive: true });

  onLog({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `Cloning ${repoUrl} @ ${branch}...`,
    source: "build",
  });

  const git = simpleGit();

  await git.clone(repoUrl, buildPath, [
    "--branch",
    branch,
    "--depth",
    "50",
  ]);

  await simpleGit(buildPath).checkout(commitSha);

  onLog({
    timestamp: new Date().toISOString(),
    level: "info",
    message: `✓ Cloned at ${commitSha.substring(0, 8)}`,
    source: "build",
  });

  return buildPath;
}

export function cleanupBuild(buildId: string): void {
  const p = require("path").join(config.buildCachePath, String(buildId));
  if (require("fs").existsSync(p))
    require("fs").rmSync(p, { recursive: true, force: true });
}