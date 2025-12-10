import { apiClient, type ApiComponents} from '@/services/ApiClient.ts';

export type AddressInfo = ApiComponents['schemas']['AddressJson'];

export default class AddressService {

  async getCityFromZip(zip: string): Promise<AddressInfo> {
    const result = await apiClient.get('/api/v1/address', {params: { zip },});
    // API returns an array of addresses, we take the first one
    const addresses = Array.isArray(result) ? result : [];
    return (addresses.length > 0 ? addresses[0] : {}) as AddressInfo;
  }

}