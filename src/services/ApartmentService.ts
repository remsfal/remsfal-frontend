import { typedRequest } from '../../src/services/api/typedRequest';
import type { paths, components } from '../../src/services/api/platform-schema';

// --- Unified type export ---
export type Apartment = components['schemas']['ApartmentJson'];

// --- Service ---
class ApartmentService {
  private static readonly BASE_ENDPOINT = '/api/v1/projects' as const;

  create(projectId: string, buildingId: string, apartment: Apartment) {
    return typedRequest<
      '/api/v1/projects/{projectId}/buildings/{buildingId}/apartments',
      'post',
      Apartment
    >('post', `${ApartmentService.BASE_ENDPOINT}/{projectId}/buildings/{buildingId}/apartments`, {
      pathParams: { projectId, buildingId },
      body: apartment,
    });
  }

  get(projectId: string, apartmentId: string) {
    return typedRequest<
      '/api/v1/projects/{projectId}/apartments/{apartmentId}',
      'get',
      Apartment
    >('get', `${ApartmentService.BASE_ENDPOINT}/{projectId}/apartments/{apartmentId}`, {
      pathParams: { projectId, apartmentId },
    });
  }

  update(projectId: string, apartmentId: string, apartment: Apartment) {
    return typedRequest<
      '/api/v1/projects/{projectId}/apartments/{apartmentId}',
      'patch',
      Apartment
    >('patch', `${ApartmentService.BASE_ENDPOINT}/{projectId}/apartments/{apartmentId}`, {
      pathParams: { projectId, apartmentId },
      body: apartment,
    });
  }

  delete(projectId: string, apartmentId: string) {
    return typedRequest<
      '/api/v1/projects/{projectId}/apartments/{apartmentId}',
      'delete'
    >('delete', `${ApartmentService.BASE_ENDPOINT}/{projectId}/apartments/{apartmentId}`, {
      pathParams: { projectId, apartmentId },
    });
  }
}

export const apartmentService = new ApartmentService();
