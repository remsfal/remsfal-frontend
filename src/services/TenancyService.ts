import { typedRequest } from '../../src/services/api/typedRequest';
import type { paths } from '../../src/services/api/platform-schema';

// Response type for fetching all tenancies (works because 200 exists)
type GetTenanciesResponse =
  paths['/api/v1/tenancies']['get']['responses']['200']['content']['application/json'];

// TEMPORARY: Response type for single tenancy
// Since the backend spec doesn't have 200 yet, we use unknown
type GetTenancyResponse = unknown;

export default class TenancyService {
  // Fetch all tenancies
  async fetchTenancies(): Promise<GetTenanciesResponse> {
    return typedRequest('get', '/api/v1/tenancies');
  }

  // Fetch a single tenancy by tenancyId and rentalId
  async fetchTenancy(tenancyId: string, rentalId: string): Promise<GetTenancyResponse> {
    try {
      return await typedRequest('get', '/api/v1/tenancies/{tenancyId}/apartments/{rentalId}', {
        pathParams: { tenancyId, rentalId },
      });
    } catch (err: any) {
      if (err.status === 404) return null; // handle not found
      throw err;
    }
  }

  async deleteTenancy(tenancyId: string): Promise<void> {
    // TODO: Implement
  }

  async updateTenancyTenantItem(tenant: TenancyTenantItem): Promise<void> {
    // TODO: Implement
  }

  async updateTenancyUnitItem(tenant: TenancyUnitItem): Promise<void> {
    // TODO: Implement
  }

  async createTenancy(tenancy: TenancyItem): Promise<void> {
    // TODO: Implement
  }

  async updateTenancy(tenancy: TenancyItem | null): Promise<void> {
    // TODO: Implement
  }
}

// TEMPORARY: Replace with generated types from backend spec when available
// Temporary types until backend spec is fixed
export type TenancyItem = {
  rentalStart?: Date;
  rentalEnd?: Date;
  // add other fields you actually use
};
export type TenancyTenantItem = unknown;
export type TenancyUnitItem = unknown;

export const tenancyService = new TenancyService();
