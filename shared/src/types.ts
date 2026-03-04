export type ProjectStatus = "active"|"building"|"failed"|"stopped";
export type DeploymentStatus = "queued"|"building"|"deploying"|"running"|"failed"|"stopped"|"rolled_back";
export type BuildStep = "clone"|"build"|"deploy"|"health_check"|"done"|"failed";

export interface Project {
  id: string;
  name: string;
  slug: string;
  githubRepo: string;
  githubBranch: string;
  status: ProjectStatus;
  subdomain: string;
  envVars: EnvVar[];
  resourceLimits: ResourceLimits;
  autoRedeploy: boolean;
  webhookSecret: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  commitSha: string;
  commitMessage: string;
  commitAuthor: string;
  branch: string;
  status: DeploymentStatus;
  buildStep: BuildStep;
  imageTag: string;
  containerId?: string;
  port?: number;
  logs: LogEntry[];
  startedAt: string;
  finishedAt?: string;
  duration?: number;
  triggeredBy: "webhook"|"manual"|"rollback";
  isActive: boolean;
  healthStatus?: "healthy"|"unhealthy"|"unknown";
}

export interface LogEntry {
  timestamp: string;
  level: "info"|"warn"|"error"|"debug";
  message: string;
  source: "build"|"deploy"|"runtime"|"system";
}

export interface EnvVar { key: string; value: string; isSecret: boolean; }
export interface ResourceLimits { cpuShares: number; memoryMb: number; storageGb: number; }

export interface Metrics {
  id: string;
  projectId: string;
  deploymentId: string;
  timestamp: string;
  cpu: number;
  memory: number;
  memoryLimit: number;
  networkIn: number;
  networkOut: number;
}

export interface BuildJob {
  id: string;
  projectId: string;
  deploymentId: string;
  githubRepo: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  commitAuthor: string;
  envVars: EnvVar[];
  resourceLimits: ResourceLimits;
  subdomain: string;
  triggeredBy: "webhook"|"manual"|"rollback";
  rollbackImageTag?: string;
}
