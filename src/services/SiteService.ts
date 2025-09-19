import axios from 'axios';

export interface SiteUnit {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  usableSpace?: number;
}

class SiteService {
  private readonly baseUrl: string = '/api/v1/projects';

  async createSite(projectId: string, propertyId: string, site: SiteUnit): Promise<SiteUnit> {
    return axios
      .post(`${this.baseUrl}/${projectId}/properties/${propertyId}/sites`, site)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async getSite(projectId: string, siteId: string): Promise<SiteUnit> {
    return axios.get(`${this.baseUrl}/${projectId}/sites/${siteId}`).then((response) => {
      console.debug(response);
      return response.data;
    });
  }

  async updateSite(projectId: string, siteId: string, site: SiteUnit): Promise<SiteUnit> {
    return axios.patch(`${this.baseUrl}/${projectId}/sites/${siteId}`, site).then((response) => {
      console.debug(response);
      return response.data;
    });
  }

  async deleteSite(projectId: string, siteId: string): Promise<void> {
    return axios.delete(`${this.baseUrl}/${projectId}/sites/${siteId}`).then((response) => {
      console.debug(response);
    });
  }
}

export const siteService: SiteService = new SiteService();
