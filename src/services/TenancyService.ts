import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type TenancyJson = ApiComponents['schemas']['TenancyJson'];
export type UnitType = ApiComponents['schemas']['UnitType'];
export type TenancyListJson = ApiComponents['schemas']['TenancyListJson'];
export type RentalUnitJson = ApiComponents['schemas']['RentalUnitJson'];

class TenancyService {
  async getTenancies(): Promise<TenancyJson[]> {
    const result = await apiClient.get('/api/v1/tenancies');
    return result.agreements || [];
  }
}

export const tenancyService = new TenancyService();
