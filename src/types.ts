export type ProjectStatus = 'Intake / Proposed' | 'Scoping' | 'In Progress' | 'Pilot / Testing' | 'Review / Approval' | 'Launched';
export type ProjectPriority = 'Low' | 'Medium' | 'High';

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  owner: { name: string; initials: string; avatar?: string };
  tags: string[];
  progress: number;
  department: string;
  preservationScore: number;
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
  projectsByStatus: Record<ProjectStatus, number>;
}
