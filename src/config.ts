/**
 * ProjectPulse Configuration
 *
 * This is the single source of truth for all customization.
 * Change these values to rebrand the entire application for your organization.
 */

// ─── Workflow Configuration ──────────────────────────────────────────────────
// Define the stages projects move through. Order matters (left-to-right on the Kanban board).
// Each stage has a label (shown in UI) and a color class (Tailwind) for visual distinction.
export const WORKFLOW_STAGES = [
  { key: 'intake',    label: 'Intake / Proposed',   color: 'bg-on-surface-variant/40', border: 'border-slate-300' },
  { key: 'scoping',   label: 'Scoping',             color: 'bg-primary/40',            border: 'border-primary-fixed' },
  { key: 'active',    label: 'In Progress',          color: 'bg-blue-500 animate-pulse', border: 'border-blue-600' },
  { key: 'testing',   label: 'Pilot / Testing',      color: 'bg-amber-500',             border: 'border-amber-500' },
  { key: 'review',    label: 'Review / Approval',    color: 'bg-purple-500',            border: 'border-purple-500' },
  { key: 'launched',  label: 'Launched',              color: 'bg-tertiary-fixed',        border: 'border-tertiary-fixed-dim' },
] as const;

// Derive the status type from the workflow stages so it stays in sync.
export type ProjectStatus = (typeof WORKFLOW_STAGES)[number]['label'];

// All valid status labels as an array (useful for validation and selects).
export const PROJECT_STATUSES: ProjectStatus[] = WORKFLOW_STAGES.map(s => s.label);

// Priority levels for projects.
export const PRIORITY_LEVELS = ['Low', 'Medium', 'High'] as const;
export type ProjectPriority = (typeof PRIORITY_LEVELS)[number];

// Risk factor options.
export const RISK_FACTORS = ['Low', 'Medium', 'High', 'Stable'] as const;

// ─── Branding & Text ─────────────────────────────────────────────────────────
export const APP_CONFIG = {
  // Core identity
  appName: 'ProjectPulse',
  orgName: 'Your Organization',
  portalName: 'ProjectPulse',
  subHeading: 'Stakeholder Portal',

  // Hero section (public dashboard)
  heroTitle: 'Driving Impact Through Transparent Project Management',
  heroSubtitle: 'Track our progress as we move initiatives from concept to launch. See real-time status, priorities, and outcomes across the portfolio.',

  // Labels used throughout the app (change these to fit your domain)
  projectCodePrefix: 'PP',       // Auto-generated codes like PP-342
  projectLabel: 'Project',       // Singular
  projectLabelPlural: 'Projects', // Plural
  ownerLabel: 'Lead',            // e.g. "Lead: Jane Doe"
  departmentLabel: 'Department',
  healthScoreLabel: 'Health Score',

  // Footer
  footerText: 'ProjectPulse. All rights reserved.',

  // Default avatar fallback (data URI so no external requests)
  defaultAvatar: '',

  // Default role label shown under the user name in the topbar
  defaultRoleLabel: 'Team Member',
};
