import type { ApiComponents } from '@/services/ApiClient';

/*
 * Issue enum types shared by all views (project, tenant, manager, contractor).
 * They live here instead of in a view-specific IssueService so that other views
 * do not have to reach into `features/project/issues`.
 */
export type IssueCategory = ApiComponents['schemas']['IssueCategory'];
export type IssueStatus = ApiComponents['schemas']['IssueStatus'];
export type IssueType = ApiComponents['schemas']['IssueType'];
export type IssuePriority = ApiComponents['schemas']['IssuePriority'];
