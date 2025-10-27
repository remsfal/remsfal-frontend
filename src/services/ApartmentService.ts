import { typedRequest } from '@/services/api/typedRequest';
import type { components } from '@/services/api/platform-schema';

export type Apartment = components['schemas']['ApartmentJson'];

export default class ApartmentService {
  static readonly BASE_PATH = '/api/v1/projects' as const;

  // Create a new apartment
  async createApartment(projectId: string, buildingId: string, data: Apartment): Promise<Apartment> {
    const apartment = await typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments',
      'post',
      Apartment
    >('post', `${ApartmentService.BASE_PATH}/{projectId}/buildings/{buildingId}/apartments`, {
      pathParams: { projectId, buildingId },
      body: data,
    });
    console.log('POST create apartment:', apartment);
    return apartment;
  }

  // Get a single apartment
  async getApartment(projectId: string, apartmentId: string): Promise<Apartment> {
    try {
      const apartment = await typedRequest<'/api/v1/projects/{projectId}/apartments/{apartmentId}', 'get', Apartment>(
        'get',
        `${ApartmentService.BASE_PATH}/{projectId}/apartments/{apartmentId}`,
        { pathParams: { projectId, apartmentId } },
      );
      console.log('GET apartment:', apartment);
      return apartment;
    } catch (error: any) {
      console.error('apartment retrieval error', error?.response?.status || error);
      throw error?.response?.status || error;
    }
  }

  // Update an apartment
  async updateApartment(projectId: string, apartmentId: string, data: Apartment): Promise<Apartment> {
    const updated = await typedRequest<'/api/v1/projects/{projectId}/apartments/{apartmentId}', 'patch', Apartment>(
      'patch',
      `${ApartmentService.BASE_PATH}/{projectId}/apartments/{apartmentId}`,
      { pathParams: { projectId, apartmentId }, body: data },
    );
    console.log('PATCH update apartment:', updated);
    return updated;
  }

  // Delete an apartment (returns boolean for success/failure)
  async deleteApartment(projectId: string, apartmentId: string): Promise<boolean> {
    try {
      await typedRequest<'/api/v1/projects/{projectId}/apartments/{apartmentId}', 'delete'>(
        'delete',
        `${ApartmentService.BASE_PATH}/{projectId}/apartments/{apartmentId}`,
        { pathParams: { projectId, apartmentId } },
      );
      console.log('DELETE apartment successful', apartmentId);
      return true;
    } catch (error) {
      console.error('DELETE apartment failed:', error);
      return false;
    }
  }
}

export const apartmentService = new ApartmentService();
