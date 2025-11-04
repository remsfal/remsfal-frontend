import { apiClient, type ApiComponents } from '@/services/ApiClient.ts';

/** -------------------- TYPES & UTILS -------------------- **/

// Backend-driven types for properties and tree nodes
export type PropertyUnit = ApiComponents['schemas']['PropertyJson'];
export type PropertyList = ApiComponents['schemas']['PropertyListJson'];
export type RentableUnitTreeNode = ApiComponents['schemas']['RentalUnitTreeNodeJson'];
export type RentalUnitNodeData = ApiComponents['schemas']['RentalUnitNodeDataJson'];
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
  async createProperty(projectId: string, property: PropertyUnit): Promise<PropertyUnit> {
    return apiClient.post(
      '/api/v1/projects/{projectId}/properties',
      property,
      {pathParams: { projectId },},
    ) as Promise<PropertyUnit>;
  }

  async getPropertyTree(projectId: string): Promise<PropertyList> {
    return apiClient.get('/api/v1/projects/{projectId}/properties', {pathParams: { projectId },});
  }

  async getProperty(projectId: string, propertyId: string): Promise<PropertyUnit> {
    return apiClient.get('/api/v1/projects/{projectId}/properties/{propertyId}', {pathParams: { projectId, propertyId },});
  }

  async updateProperty(projectId: string, propertyId: string, property: PropertyUnit): Promise<PropertyUnit> {
    return apiClient.patch(
      '/api/v1/projects/{projectId}/properties/{propertyId}',
      property,
      {pathParams: { projectId, propertyId },},
    );
  }

  async deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return apiClient.delete('/api/v1/projects/{projectId}/properties/{propertyId}', {pathParams: { projectId, propertyId },});
  }
}

export const propertyService = new PropertyService();
