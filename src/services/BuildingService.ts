import axios from 'axios';

export interface BuildingUnit {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  livingSpace?: number;
  commercialSpace?: number;
  usableSpace?: number;
  heatingSpace?: number;
  street?: string;
  zip?: string;
  city?: string;
  province?: string;
  country?: string;
  countryCode?: string;
}

class BuildingService {
  private readonly baseUrl: string = '/api/v1/projects';

  async createBuilding(
    projectId: string,
    propertyId: string,
    building: BuildingUnit,
  ): Promise<BuildingUnit> {
    return axios
      .post(`${this.baseUrl}/${projectId}/properties/${propertyId}/buildings`, building)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async getBuilding(projectId: string, buildingId: string): Promise<BuildingUnit> {
    return axios.get(`${this.baseUrl}/${projectId}/buildings/${buildingId}`).then((response) => {
      console.debug(response);
      return response.data;
    });
  }

  async updateBuilding(
    projectId: string,
    buildingId: string,
    building: BuildingUnit,
  ): Promise<BuildingUnit> {
    return axios
      .patch(`${this.baseUrl}/${projectId}/buildings/${buildingId}`, building)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async deleteBuilding(projectId: string, buildingId: string): Promise<void> {
    return axios.delete(`${this.baseUrl}/${projectId}/buildings/${buildingId}`).then((response) => {
      console.debug(response);
    });
  }
}

export const buildingService: BuildingService = new BuildingService();
