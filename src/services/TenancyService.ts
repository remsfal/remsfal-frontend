import { typedRequest } from '../../src/services/api/typedRequest';
import type { components } from '../../src/services/api/platform-schema'; // generated OpenAPI types

type TenancyJson = components["schemas"]["TenancyJson"];
type TenancyListJson = TenancyJson[]; // assuming the endpoint returns an array of tenancies
export type TenancyItem = components['schemas']['TenancyItemJson'];


export default class TenancyService {
  // Fetch all tenancies from backend
  async fetchTenancyData(): Promise<TenancyListJson> {
    return typedRequest<'/api/v1/tenancies', 'get', TenancyListJson>(
      'get',
      '/api/v1/tenancies'
    );
  }

  // Fetch flattened list of tenants from all tenancies
  async fetchTenantData(): Promise<components['schemas']['UserJson'][]> {
    const tenancies = await this.fetchTenancyData(); // returns array
    return tenancies.flatMap(t => t.tenants ?? []); // flatten tenants array
  }

  // Load a specific tenancy by ID
  async loadTenancyData(id: string): Promise<TenancyJson | null> {
    const tenancies = await this.fetchTenancyData(); // returns array directly
    return tenancies.find(t => t.id === id) || null;
  }

  // Delete a tenancy by ID
  async deleteTenancy(tenancyId: string): Promise<void> {
    // TODO: Implement API call
  }

  // Update a tenant item
  async updateTenancyTenantItem(tenant: components['schemas']['UserJson']): Promise<void> {
    // TODO: Implement API call
  }

  // Update a tenancy unit/item
  async updateTenancyUnitItem(unit: components['schemas']['TenancyItemJson']): Promise<void> {
    // TODO: Implement API call
  }

  // Create a new tenancy
  async createTenancy(tenancy: TenancyJson): Promise<void> {
    // TODO: Implement API call
  }

  // Update an existing tenancy
  async updateTenancy(tenancy: TenancyJson): Promise<void> {
    // TODO: Implement API call
  }
}

export const tenancyService = new TenancyService();
