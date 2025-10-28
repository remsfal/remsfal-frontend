import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

export type Apartment = ApiComponents['schemas']['ApartmentJson'];

export default class ApartmentService {
  // Create a new apartment
  async createApartment(projectId: string, buildingId: string, data: Apartment): Promise<Apartment> {
    const apartment = await apiClient.post(
      '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments',
      data,
      { pathParams: { projectId, buildingId } },
    ) as Apartment;
    console.log('POST create apartment:', apartment);
    return apartment;
  }

  // Get a single apartment
  async getApartment(projectId: string, apartmentId: string): Promise<Apartment> {
    try {
      const apartment = await apiClient.get(
        '/api/v1/projects/{projectId}/apartments/{apartmentId}',
        { pathParams: { projectId, apartmentId } },
      ) as Apartment;
      console.log('GET apartment:', apartment);
      return apartment;
    } catch (error: any) {
      console.error('apartment retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update an apartment
  async updateApartment(projectId: string, apartmentId: string, data: Apartment): Promise<Apartment> {
    const updated = await apiClient.patch(
      '/api/v1/projects/{projectId}/apartments/{apartmentId}',
      data,
      { pathParams: { projectId, apartmentId } },
    ) as Apartment;
    console.log('PATCH update apartment:', updated);
    return updated;
  }

  // Delete an apartment (returns boolean for success/failure)
  async deleteApartment(projectId: string, apartmentId: string): Promise<boolean> {
    try {
      await apiClient.delete('/api/v1/projects/{projectId}/apartments/{apartmentId}', {
        pathParams: { projectId, apartmentId },
      });
      console.log('DELETE apartment successful', apartmentId);
      return true;
    } catch (error) {
      console.error('DELETE apartment failed:', error);
      return false;
    }
  }
}

export const apartmentService = new ApartmentService();
