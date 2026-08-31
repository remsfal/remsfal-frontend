import { apiClient, type ApiComponents, type Readable } from '@/services/ApiClient';

export type TenancyJson = Readable<ApiComponents['schemas']['TenancyJson']>;
export type UnitType = ApiComponents['schemas']['UnitType'];
export type TenancyListJson = Readable<ApiComponents['schemas']['TenancyListJson']>;
export type RentalUnitJson = Readable<ApiComponents['schemas']['RentalUnitJson']>;
export type AddressJson = Readable<ApiComponents['schemas']['AddressJson']>;

export function formatTenancyLabel(tenancy: TenancyJson): string {
  const addr = tenancy.address;
  if (addr && (addr.street || addr.zip || addr.city)) {
    const parts: string[] = [];
    if (addr.street) parts.push(addr.street);
    const zipCity = [addr.zip, addr.city].filter(Boolean).join(' ');
    if (zipCity) parts.push(zipCity);
    return parts.join(', ');
  }
  return tenancy.projectTitle || 'Unbekanntes Mietverhältnis';
}

class TenancyService {
  async getTenancies(): Promise<TenancyJson[]> {
    const result = await apiClient.get('/api/v1/tenancies');
    return result.agreements || [];
  }
}

export const tenancyService = new TenancyService();
