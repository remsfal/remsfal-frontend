import { typedRequest } from '@/services/api/typedRequest';
import type { components, paths } from '../../src/services/api/platform-schema';

export type PropertyUnit = components['schemas']['PropertyJson'];
export type PropertyList = components['schemas']['PropertyListJson'];

class PropertyService {
  private readonly baseUrl = '/api/v1/projects';

  async createProperty(
    projectId: string,
    property: PropertyUnit
  ): Promise<PropertyUnit> {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties',
      'post',
      PropertyUnit
    >('post', `${this.baseUrl}/{projectId}/properties`, {
      pathParams: { projectId },
      body: property,
    });
  }

  async getPropertyTree(projectId: string): Promise<PropertyList> {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties',
      'get',
      PropertyList
    >('get', `${this.baseUrl}/{projectId}/properties`, {
      pathParams: { projectId },
    });
  }

  async getProperty(projectId: string, propertyId: string): Promise<PropertyUnit> {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      'get',
      PropertyUnit
    >('get', `${this.baseUrl}/{projectId}/properties/{propertyId}`, {
      pathParams: { projectId, propertyId },
    });
  }

  async updateProperty(projectId: string, propertyId: string, property: PropertyUnit): Promise<PropertyUnit> {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      'patch',
      PropertyUnit
    >('patch', `${this.baseUrl}/{projectId}/properties/{propertyId}`, {
      pathParams: { projectId, propertyId },
      body: property,
    });
  }

  async deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return typedRequest<
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      'delete',
      void
    >('delete', `${this.baseUrl}/{projectId}/properties/{propertyId}`, {
      pathParams: { projectId, propertyId },
    });
  }
}

export const propertyService = new PropertyService();
