import axios from 'axios';

export interface ApartmentUnit {
  id?: string
  title: string
  description?: string
  location?: string
  livingSpace?: number
  usableSpace?: number
  heatingSpace?: number
}

class ApartmentService {
  private readonly baseUrl: string = '/api/v1/projects';

  async createApartment(
    projectId: string,
    buildingId: string,
    apartment: ApartmentUnit,
  ): Promise<ApartmentUnit> {
    return axios
      .post(`${this.baseUrl}/${projectId}/buildings/${buildingId}/apartments`, apartment)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async getApartment(projectId: string, apartmentId: string): Promise<ApartmentUnit> {
    return axios
      .get(`${this.baseUrl}/${projectId}/apartments/${apartmentId}`)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async updateApartment(
    projectId: string,
    apartmentId: string,
    apartment: ApartmentUnit,
  ): Promise<ApartmentUnit> {
    return axios
      .patch(`${this.baseUrl}/${projectId}/apartments/${apartmentId}`, apartment)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async deleteApartment(projectId: string, apartmentId: string): Promise<void> {
    return axios
      .delete(`${this.baseUrl}/${projectId}/apartments/${apartmentId}`)
      .then((response) => {
        console.debug(response);
      });
  }
}

export const apartmentService: ApartmentService = new ApartmentService();
