import { typedRequest } from '@/services/api/typedRequest';
import type { paths } from '@/services/api/platform-schema';

// Response type for fetching all tenancies
export type GetTenanciesResponse =
  paths['/api/v1/tenancies']['get']['responses']['200']['content']['application/json'];

// TEMPORARY: Response type for single tenancy (backend spec incomplete)
type GetTenancyResponse = unknown;

export default class TenancyService {
  // Fetch all tenancies
  async fetchTenancies(): Promise<GetTenanciesResponse> {
    return typedRequest('get', '/api/v1/tenancies');
  }

  // Fetch a single tenancy by tenancyId and rentalId
  async fetchTenancy(tenancyId: string, rentalId: string): Promise<GetTenancyResponse> {
    try {
      return await typedRequest(
        'get',
        '/api/v1/tenancies/{tenancyId}/apartments/{rentalId}',
        { pathParams: { tenancyId, rentalId } }
      );
    } catch (err: any) {
      if (err.status === 404) return null; // not found → null
      throw err;
    }
  }

  // TODO methods
  async deleteTenancy(tenancyId: string): Promise<void> {}
  async updateTenancyTenantItem(tenant: TenancyTenantItem): Promise<void> {}
  async updateTenancyUnitItem(tenant: TenancyUnitItem): Promise<void> {}
  async createTenancy(tenancy: TenancyItem): Promise<void> {}
  async updateTenancy(tenancy: TenancyItem | null): Promise<void> {}
}

// Temporary placeholder types until backend schema is updated
export type TenancyItem = { rentalStart?: Date; rentalEnd?: Date };
export type TenancyTenantItem = unknown;
export type TenancyUnitItem = unknown;

export const tenancyService = new TenancyService();
