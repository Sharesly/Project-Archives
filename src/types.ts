import type { ProjectStatus, ProjectPriority } from './config';

export type { ProjectStatus, ProjectPriority };

export interface ProjectOwner {
  name: string;
  initials: string;
  avatar?: string;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  owner: ProjectOwner;
  tags: string[];
  progress: number;
  department: string;
  healthScore: number;
  riskFactor: string;
}

export interface Comment {
  id: string;
  projectId: string;
  author: { name: string; avatar?: string; initials: string };
  text: string;
  timestamp: string;
}

export interface Metrics {
  totalRecords: number;
  riskLevel: string;
  activeProjects: number;
  projectsByStatus: Record<string, number>;
}
