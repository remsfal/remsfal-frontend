import axios from 'axios';

export interface GarageUnit {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  usableSpace?: number;
  heatingSpace?: number;
}

class GarageService {
  private readonly baseUrl: string = '/api/v1/projects';

  async createGarage(
    projectId: string,
    buildingId: string,
    garage: GarageUnit,
  ): Promise<GarageUnit> {
    return axios
      .post(`${this.baseUrl}/${projectId}/buildings/${buildingId}/garages`, garage)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async getGarage(projectId: string, garageId: string): Promise<GarageUnit> {
    return axios.get(`${this.baseUrl}/${projectId}/garages/${garageId}`).then((response) => {
      console.debug(response);
      return response.data;
    });
  }

  async updateGarage(projectId: string, garageId: string, garage: GarageUnit): Promise<GarageUnit> {
    return axios
      .patch(`${this.baseUrl}/${projectId}/garages/${garageId}`, garage)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async deleteGarage(projectId: string, garageId: string): Promise<void> {
    return axios.delete(`${this.baseUrl}/${projectId}/garages/${garageId}`).then((response) => {
      console.debug(response);
    });
  }
}

export const garageService: GarageService = new GarageService();
