import { typedRequest } from '../../src/services/api/typedRequest';
import type { components } from '../../src/services/api/platform-schema';

export type TenancyItem = components['schemas']['TenancyItemJson'];
export type TenancyTenantItem = components['schemas']['UserJson'];
export type TenancyJson = components['schemas']['TenancyJson'];
export type TenancyListJson = TenancyJson[];

export default class TenancyService {
  async fetchTenancyData(): Promise<TenancyListJson> {
    return typedRequest<'/api/v1/tenancies', 'get', TenancyListJson>(
      'get',
      '/api/v1/tenancies'
    );
  }

  async fetchTenantData(): Promise<TenancyTenantItem[]> {
    const tenancies = await this.fetchTenancyData();
    return tenancies.flatMap(t => t.tenants ?? []);
  }

  async loadTenancyData(id: string): Promise<TenancyJson | null> {
    const tenancies = await this.fetchTenancyData();
    return tenancies.find(t => t.id === id) || null;
  }

  async deleteTenancy(_tenancyId: string): Promise<void> {
    // TODO: Implement API call
  }

  async updateTenancyTenantItem(_tenant: TenancyTenantItem): Promise<void> {
    // TODO: Implement API call
  }

  async createTenancy(_tenancy: TenancyJson): Promise<void> {
    // TODO: Implement API call
  }

  async updateTenancy(_tenancy: TenancyJson | null): Promise<void> {
    // TODO: Implement API call
  }

  //  Correct type for units
  async updateTenancyUnitItem(unit: TenancyItem): Promise<void> {
    // TODO: Implement API call
    console.log('Updating unit', unit);
  }
}

export const tenancyService = new TenancyService();
