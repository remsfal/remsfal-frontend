import axios from 'axios';

export enum EntityType {
  Apartment = 'APARTMENT',
  Commercial = 'COMMERCIAL',
  Garage = 'GARAGE',
  Site = 'SITE',
  Building = 'BUILDING',
  Project = 'PROJECT',
  Property = 'PROPERTY',
}

export interface RentableUnitNodeData {
  type: EntityType;
  title?: string;
  description?: string;
  tenant?: string;
  usable_space?: number;
  isButtonRow?: boolean;
}

export interface RentableUnitTreeNode {
  key: string;
  data: RentableUnitNodeData;
  children: RentableUnitTreeNode[];
}

export interface PropertyList {
  properties: RentableUnitTreeNode[];
}

export interface PropertyUnit {
  id?: string;
  title: string;
  description?: string;
  landRegisterEntry?: string;
  plotArea?: number;
  effective_space?: number;
  district?: string; // Gemarkung
  corridor?: string; // Flur
  parcel?: string; // Flurstück
  landRegistry?: string; // Liegenschaftsbuch
  usageType?: string | null; // Wirtschaftsart
}

class PropertyService {
  private readonly baseUrl: string = '/api/v1/projects';

  async createProperty(
    projectId: string,
    property: PropertyUnit,
  ): Promise<PropertyUnit> {
    return axios
      .post(`${this.baseUrl}/${projectId}/properties/`, property)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async getPropertyTree(projectId: string): Promise<PropertyList> {
    return axios
      .get(`${this.baseUrl}/${projectId}/properties`)
      .then((response) => {
        console.log('properties returned', response.data);
        return response.data;
      });
  }

  async getProperty(projectId: string, propertyId: string): Promise<PropertyUnit> {
    return axios
      .get(`${this.baseUrl}/${projectId}/properties/${propertyId}`)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async updateProperty(
    projectId: string,
    propertyId: string,
    property: PropertyUnit,
  ): Promise<PropertyUnit> {
    return axios
      .patch(`${this.baseUrl}/${projectId}/properties/${propertyId}`, property)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return axios
      .delete(`${this.baseUrl}/${projectId}/properties/${propertyId}`)
      .then((response) => {
        console.debug(response);
      });
  }
}

export const propertyService: PropertyService = new PropertyService();
