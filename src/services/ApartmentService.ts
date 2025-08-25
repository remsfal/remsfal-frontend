import { typedRequest } from '../../src/services/api/typedRequest';
import type { paths, components } from '../../src/services/api/platform-schema';

export type CreateApartmentRequest =
  paths['/api/v1/projects/{projectId}/buildings/{buildingId}/apartments']['post']['requestBody']['content']['application/json'];

// There is no GET success response, so we fallback to ApartmentJson directly wait until backend update 
export type ApartmentResponse = components['schemas']['ApartmentJson'];

export type UpdateApartmentRequest =
  paths['/api/v1/projects/{projectId}/apartments/{apartmentId}']['patch']['requestBody']['content']['application/json'];

export default class ApartmentService {
  private static readonly BASE_ENDPOINT = '/api/v1/projects' as const;

  createApartment(projectId: string, buildingId: string, apartment: CreateApartmentRequest) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments',
      'post',
      ApartmentResponse
    >('post', `${ApartmentService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}/apartments`, {
      pathParams: { projectId, buildingId },
      body: apartment,
    });
  }

  getApartment(projectId: string, apartmentId: string) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments/{apartmentId}',
      'get',
      ApartmentResponse
    >(
      'get',
      `${ApartmentService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}/apartments/{apartmentId}`,
      {
        pathParams: { projectId, apartmentId },
      },
    );
  }

  updateApartment(projectId: string, apartmentId: string, apartment: UpdateApartmentRequest) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments/{apartmentId}',
      'patch',
      ApartmentResponse
    >(
      'patch',
      `${ApartmentService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}/apartments/{apartmentId}`,
      {
        pathParams: { projectId, apartmentId },
        body: apartment,
      },
    );
  }

  async deleteApartment(projectId: string, apartmentId: string) {
    try {
      await typedRequest<
        '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments/{apartmentId}',
        'delete'
      >(
        'delete',
        `${ApartmentService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}/apartments/{apartmentId}`,
        {
          pathParams: { projectId, apartmentId },
        },
      );
      console.log('DELETE apartment successful');
      return true;
    } catch (error) {
      console.error('DELETE apartment failed:', error);
      return false;
    }
  }
}

export const apartmentService = new ApartmentService();
