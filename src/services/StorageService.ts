import axios from 'axios';

export interface StorageUnit {
  id?: string
  title: string
  description?: string
  location?: string
  usableSpace?: number
  heatingSpace?: number
}

class StorageService {
  private readonly baseUrl: string = '/api/v1/projects';

  async createStorage(
    projectId: string,
    buildingId: string,
    storage: StorageUnit,
  ): Promise<StorageUnit> {
    return axios
      .post(`${this.baseUrl}/${projectId}/buildings/${buildingId}/storages`, storage)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async getStorage(projectId: string, storageId: string): Promise<StorageUnit> {
    return axios
      .get(`${this.baseUrl}/${projectId}/storages/${storageId}`)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async updateStorage(
    projectId: string,
    storageId: string,
    storage: StorageUnit,
  ): Promise<StorageUnit> {
    return axios
      .patch(`${this.baseUrl}/${projectId}/storages/${storageId}`, storage)
      .then((response) => {
        console.debug(response);
        return response.data;
      });
  }

  async deleteStorage(projectId: string, storageId: string): Promise<void> {
    return axios
      .delete(`${this.baseUrl}/${projectId}/storages/${storageId}`)
      .then((response) => {
        console.debug(response);
      });
  }
}

export const storageService: StorageService = new StorageService();
