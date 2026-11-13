import type { ApiComponents } from '@/services/ApiClient';

/*
 * Rentable unit type shared by all views (project, tenant, contractor).
 * It lives here instead of in the project-specific PropertyService so that other views
 * do not have to reach into `features/project/rentableUnits`.
 */
export type UnitType = ApiComponents['schemas']['UnitType'];
