import { typedRequest } from '@/services/api/typedRequest';
import type { components } from '../../src/services/api/platform-schema';

/** -------------------- OLD TYPES & UTILS -------------------- **/

// Backend-driven types for properties and tree nodes
export type PropertyUnit = components['schemas']['PropertyJson'];
export type PropertyList = components['schemas']['PropertyListJson'];
export type RentableUnitTreeNode = components['schemas']['RentalUnitTreeNodeJson'];
export type RentalUnitNodeData = components['schemas']['RentalUnitNodeDataJson'];

export enum EntityType {
  Apartment = 'APARTMENT',
  Commercial = 'COMMERCIAL',
  Storage = 'STORAGE',
  Site = 'SITE',
  Building = 'BUILDING',
  Project = 'PROJECT',
  Property = 'PROPERTY',
}

export function toRentableUnitView(entity: components['schemas']['UnitType'] | undefined): string {
  if (!entity) {
    return 'View';
  }
  return entity[0]!.toUpperCase() + entity.substring(1).toLowerCase() + 'View';
}

/** -------------------- SERVICE -------------------- **/

class PropertyService {
  private readonly baseUrl = '/api/v1/projects';

  async createProperty(projectId: string, property: PropertyUnit): Promise<PropertyUnit> {
    return typedRequest<'/api/v1/projects/{projectId}/properties', 'post', PropertyUnit>(
      'post',
      `${this.baseUrl}/{projectId}/properties`,
      {
        pathParams: { projectId },
        body: property,
      },
    );
  }

  async getPropertyTree(projectId: string): Promise<PropertyList> {
    return typedRequest<'/api/v1/projects/{projectId}/properties', 'get', PropertyList>(
      'get',
      `${this.baseUrl}/{projectId}/properties`,
      {
        pathParams: { projectId },
      },
    );
  }

  async getProperty(projectId: string, propertyId: string): Promise<PropertyUnit> {
    return typedRequest<'/api/v1/projects/{projectId}/properties/{propertyId}', 'get', PropertyUnit>(
      'get',
      `${this.baseUrl}/{projectId}/properties/{propertyId}`,
      {
        pathParams: { projectId, propertyId },
      },
    );
  }

  async updateProperty(projectId: string, propertyId: string, property: PropertyUnit): Promise<PropertyUnit> {
    return typedRequest<'/api/v1/projects/{projectId}/properties/{propertyId}', 'patch', PropertyUnit>(
      'patch',
      `${this.baseUrl}/{projectId}/properties/{propertyId}`,
      {
        pathParams: { projectId, propertyId },
        body: property,
      },
    );
  }

  async deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return typedRequest<'/api/v1/projects/{projectId}/properties/{propertyId}', 'delete', void>(
      'delete',
      `${this.baseUrl}/{projectId}/properties/{propertyId}`,
      {
        pathParams: { projectId, propertyId },
      },
    );
  }
}

export const propertyService = new PropertyService();
