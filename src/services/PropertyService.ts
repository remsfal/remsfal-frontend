import { typedRequest } from '@/services/api/typedRequest';
import type { TreeNode } from 'primevue/treenode';

export enum EntityType {
  Apartment = 'APARTMENT',
  Commercial = 'COMMERCIAL',
  Storage = 'STORAGE',
  Site = 'SITE',
  Building = 'BUILDING',
  Project = 'PROJECT',
  Property = 'PROPERTY',
}

export function toRentableUnitView(entity: EntityType): string {
  return entity[0].toUpperCase() + entity.substring(1).toLowerCase() + 'View';
}

export interface RentableUnitNodeData {
  type: EntityType;
  title?: string;
  description?: string;
  tenant?: string;
  usable_space?: number;
}

export interface RentableUnitTreeNode extends TreeNode {
  key: string;
  data: RentableUnitNodeData;
  children: RentableUnitTreeNode[];
}

export interface PropertyList {
  properties: RentableUnitTreeNode[];
}

export interface PropertyUnit {
  id?: string;
  type?: 'PROPERTY' | 'SITE' | 'BUILDING' | 'APARTMENT' | 'STORAGE' | 'COMMERCIAL';
  title: string;
  description?: string;
  landRegistry?: string;         // Liegenschaftsbuch
  cadastralDistrict?: string;    // Gemarkung
  sheetNumber?: string;           // Blattnummer
  plotNumber?: number;            // Flurstücknummer
  effectiveSpace?: number;
  district?: string;              // Optional additional location info
  corridor?: string;              // Flur
  parcel?: string;                // Flurstück
  usageType?: string;             // Wirtschaftsart
}

class PropertyService {
  private readonly baseUrl = '/api/v1/projects';

  async createProperty(
    projectId: string,
    property: PropertyUnit
  ): Promise<PropertyUnit> {
    const response = await typedRequest<
      "/api/v1/projects/{projectId}/properties",
      "post"
    >('post', `${this.baseUrl}/{projectId}/properties`, {
      pathParams: { projectId },
      body: property,
    });
    console.debug(response);
    return response as PropertyUnit;
  }

  async getPropertyTree(projectId: string): Promise<PropertyList> {
    const response = await typedRequest<
      "/api/v1/projects/{projectId}/properties",
      "get"
    >('get', `${this.baseUrl}/{projectId}/properties`, {
      pathParams: { projectId },
    });
    console.log('properties returned', response);
    return response as PropertyList;
  }

  async getProperty(
    projectId: string,
    propertyId: string
  ): Promise<PropertyUnit> {
    const response = await typedRequest<
      "/api/v1/projects/{projectId}/properties/{propertyId}",
      "get"
    >('get', `${this.baseUrl}/{projectId}/properties/{propertyId}`, {
      pathParams: { projectId, propertyId },
    });
    console.debug(response);
    return response as PropertyUnit;
  }

  async updateProperty(
    projectId: string,
    propertyId: string,
    property: PropertyUnit
  ): Promise<PropertyUnit> {
    const response = await typedRequest<
      "/api/v1/projects/{projectId}/properties/{propertyId}",
      "patch"
    >('patch', `${this.baseUrl}/{projectId}/properties/{propertyId}`, {
      pathParams: { projectId, propertyId },
      body: property,
    });
    console.debug(response);
    return response as PropertyUnit;
  }

  async deleteProperty(
    projectId: string,
    propertyId: string
  ): Promise<void> {
    await typedRequest<
      "/api/v1/projects/{projectId}/properties/{propertyId}",
      "delete"
    >('delete', `${this.baseUrl}/{projectId}/properties/{propertyId}`, {
      pathParams: { projectId, propertyId },
    });
    console.debug(`Deleted property ${propertyId} from project ${projectId}`);
  }
}

export const propertyService = new PropertyService();
