import { apiClient, type ApiComponents} from '@/services/ApiClient.ts';

export type AddressJson = ApiComponents['schemas']['AddressJson'];

export default class AddressService {

  async getCityFromZip(zip: string): Promise<AddressJson> {
    const result = await apiClient.get('/api/v1/address', {params: { zip },});
    // API returns an array of addresses, we take the first one
    const addresses = Array.isArray(result) ? result : [];
    return (addresses.length > 0 ? addresses[0] : {}) as AddressJson;
  }

}