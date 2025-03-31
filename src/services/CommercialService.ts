import axios from 'axios';

export interface CommercialUnit {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  commercialSpace?: number;
  usableSpace?: number;
  heatingSpace?: number;
}

class CommercialService {
  private readonly baseUrl: string = '/api/v1/projects';

  async createCommercial(
    projectId: string,
    buildingId: string,
    commercial: CommercialUnit,
  ): Promise<CommercialUnit> {
    return axios
      .post(`${this.baseUrl}/${projectId}/buildings/${buildingId}/commercials`, commercial)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async getCommercial(projectId: string, commercialId: string): Promise<CommercialUnit> {
    return axios
      .get(`${this.baseUrl}/${projectId}/commercials/${commercialId}`)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async updateCommercial(
    projectId: string,
    commercialId: string,
    commercial: CommercialUnit,
  ): Promise<CommercialUnit> {
    return axios
      .patch(`${this.baseUrl}/${projectId}/commercials/${commercialId}`, commercial)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async deleteCommercial(projectId: string, commercialId: string): Promise<void> {
    return axios
      .delete(`${this.baseUrl}/${projectId}/commercials/${commercialId}`)
      .then((response) => {
        console.debug(response);
      });
  }
}

export const commercialService: CommercialService = new CommercialService();
