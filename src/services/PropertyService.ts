import { apiClient, type ApiComponents } from '@/services/ApiClient';

/** -------------------- TYPES & UTILS -------------------- **/

export type PropertyJson = ApiComponents['schemas']['PropertyJson'];
export type PropertyListJson = ApiComponents['schemas']['PropertyListJson'];
export type RentalUnitTreeNodeJson = ApiComponents['schemas']['RentalUnitTreeNodeJson'];
export type RentalUnitNodeDataJson = ApiComponents['schemas']['RentalUnitNodeDataJson'];
export type UnitType = ApiComponents['schemas']['UnitType'];

export enum EntityType {
  Apartment = 'APARTMENT',
  Commercial = 'COMMERCIAL',
  Storage = 'STORAGE',
  Site = 'SITE',
  Building = 'BUILDING',
  Project = 'PROJECT',
  Property = 'PROPERTY',
}

export function toRentableUnitView(entity: UnitType | undefined): string {
  if (!entity) {
    return 'View';
  }
  return entity[0]!.toUpperCase() + entity.substring(1).toLowerCase() + 'View';
}

/** -------------------- SERVICE -------------------- **/

class PropertyService {
  async createProperty(projectId: string, property: PropertyJson): Promise<PropertyJson> {
    return apiClient.post(
      '/api/v1/projects/{projectId}/properties',
      property,
      { pathParams: { projectId } },
    ) as Promise<PropertyJson>;
  }

  async getPropertyTree(projectId: string): Promise<PropertyListJson> {
    return apiClient.get(
      '/api/v1/projects/{projectId}/properties',
      { pathParams: { projectId } },
    );
  }

  async getProperty(projectId: string, propertyId: string): Promise<PropertyJson> {
    return apiClient.get(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      { pathParams: { projectId, propertyId } },
    );
  }

  async updateProperty(projectId: string, propertyId: string, property: PropertyJson): Promise<PropertyJson> {
    return apiClient.patch(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      property,
      { pathParams: { projectId, propertyId } },
    ) as Promise<PropertyJson>;
  }

  async deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return apiClient.delete(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      { pathParams: { projectId, propertyId } },
    );
  }
}

export const propertyService = new PropertyService();