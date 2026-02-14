import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type TenancyItem = ApiComponents['schemas']['TenancyItemJson'];
export type TenancyJson = ApiComponents['schemas']['TenancyJson'];
export type UnitType = ApiComponents['schemas']['UnitType'];
export type TenancyListJson = ApiComponents['schemas']['TenancyListJson'];

class TenancyService {
  async getTenancies(): Promise<TenancyItem[]> {
    const result = await apiClient.get('/api/v1/tenancies');
    const listResult = result as TenancyListJson;
    // Backend kann agreements Array liefern
    return listResult.agreements || [];
  }

  // Note: This method requires rentalId which is not available in TenancyItemJson
  // This is a limitation of the current API structure
  // In practice, the detail endpoints may not be callable without additional data
  async getTenancyDetail(tenancyId: string, rentalId: string, rentalType: UnitType): Promise<TenancyJson> {
    const typePathMap: Record<UnitType, string> = {
      'APARTMENT': 'apartments',
      'BUILDING': 'buildings',
      'COMMERCIAL': 'commercials',
      'PROPERTY': 'properties',
      'SITE': 'sites',
      'STORAGE': 'storages',
    };
    const typePath = typePathMap[rentalType];

    // Construct the path dynamically
    const path = `/api/v1/tenancies/{tenancyId}/${typePath}/{rentalId}` as any;

    return apiClient.get(path, { pathParams: { tenancyId, rentalId } }) as Promise<TenancyJson>;
  }
}

export const tenancyService = new TenancyService();
