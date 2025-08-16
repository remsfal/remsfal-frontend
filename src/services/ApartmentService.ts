import { typedRequest } from '../../src/services/api/typedRequest';

export default class ApartmentService {
  private static readonly BASE_ENDPOINT = '/api/v1/projects' as const;

  // Create apartment in a building
  createApartment(projectId: string, buildingId: string, apartment: any) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments',
      'post'
    >('post', `${ApartmentService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}/apartments`, {
      pathParams: { projectId, buildingId },
      body: apartment,
    });
  }

  // Get apartment by ID
  getApartment(projectId: string, apartmentId: string) {
    return typedRequest<
      '/api/v1/projects/{projectId}/apartments/{apartmentId}',
      'get'
    >('get', `${ApartmentService.BASE_ENDPOINT}/{projectId}/apartments/{apartmentId}`, {
      pathParams: { projectId, apartmentId },
    });
  }

  // Update apartment by ID
  updateApartment(projectId: string, apartmentId: string, apartment: any) {
    return typedRequest<
      '/api/v1/projects/{projectId}/apartments/{apartmentId}',
      'patch'
    >('patch', `${ApartmentService.BASE_ENDPOINT}/{projectId}/apartments/{apartmentId}`, {
      pathParams: { projectId, apartmentId },
      body: apartment,
    });
  }

  // Delete apartment by ID
  async deleteApartment(projectId: string, apartmentId: string) {
    try {
      await typedRequest<
        '/api/v1/projects/{projectId}/apartments/{apartmentId}',
        'delete'
      >('delete', `${ApartmentService.BASE_ENDPOINT}/{projectId}/apartments/{apartmentId}`, {
        pathParams: { projectId, apartmentId },
      });
      console.log('DELETE apartment successful');
      return true;
    } catch (error) {
      console.error('DELETE apartment failed:', error);
      return false;
    }
  }
}

export const apartmentService = new ApartmentService();
