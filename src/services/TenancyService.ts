import { typedRequest } from '../../src/services/api/typedRequest';
import type { paths, components } from '../../src/services/api/platform-schema'; // generated OpenAPI types

type UserJson = components["schemas"]["UserJson"];
type TenancyJson = components["schemas"]["TenancyJson"];
type TenancyItemJson = components["schemas"]["TenancyItemJson"];

export default class TenancyService {
  // Fetch all tenants from backend
  async fetchTenantData(): Promise<UserJson[]> {
    const tenancies = await this.fetchTenancyData();
    return tenancies.flatMap(t => t.tenants || []);
  }
  
  // Fetch all tenancies from backend
  async fetchTenancyData(): Promise<TenancyJson[]> {
    return typedRequest<'/api/v1/tenancies', 'get', TenancyJson[]>('get', '/api/v1/tenancies');
  }

  // Load a specific tenancy by ID
  async loadTenancyData(id: string): Promise<TenancyJson | null> {
    const allTenancies = await this.fetchTenancyData();
    return allTenancies.find((tenancy) => tenancy.id === id) || null;
  }
  

  // Delete a tenancy by ID
  async deleteTenancy(tenancyId: string): Promise<void> {
    // TODO: Implementieren
  }

  // Update a tenant item
  async updateTenancyTenantItem(tenant: UserJson): Promise<void> {
    // TODO: Implementieren
  }

  // Update a tenancy unit/item
  async updateTenancyUnitItem(unit: TenancyItemJson): Promise<void> {
    // TODO: Implementieren
  }

  // Create a new tenancy
  async createTenancy(tenancy: TenancyJson): Promise<void> {
    // TODO: Implementieren
  }

  // Update an existing tenancy
  async updateTenancy(tenancy: TenancyJson): Promise<void> {
    // TODO: Implementieren
  }
}

export const tenancyService = new TenancyService();
