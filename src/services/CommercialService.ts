import axios from 'axios';

export interface CommercialItem {
  id?: string;
  buildingId: string;
  title: string;
  location: string;
  description: string;
  commercialSpace: number;
  usableSpace: number;
  heatingSpace: number;
}

export default class CommercialService {
  private readonly url: string = '/api/v1/projects';

  createCommercial(
    projectId: string,
    buildingId: string,
    commercial: CommercialItem,
    propertyId?: string,
  ) {
    if (propertyId) {
      return axios
        .post(
          `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials`,
          { commercial },
        )
        .then((response) => console.log(response))
        .catch((error) => console.error(error));
    } else {
      return axios
        .post(`${this.url}/${projectId}/buildings/${buildingId}/commercials`, { commercial })
        .then((response) => console.log(response))
        .catch((error) => console.error(error));
    }
  }

  getCommercial(projectId: string, commercialId: string, propertyId?: string, buildingId?: string) {
    if (propertyId && buildingId) {
      return axios
        .get(
          `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}`,
        )
        .then((response) => {
          console.log('commercial returned', response.data);
          return response.data;
        })
        .catch((error) => {
          console.error('Error getting commercial:', error);
          throw error;
        });
    } else {
      return axios
        .get(`${this.url}/${projectId}/commercials/${commercialId}`)
        .then((response) => {
          console.log('commercial returned', response.data);
          return response.data;
        })
        .catch((error) => {
          console.error('Error getting commercial:', error);
          throw error;
        });
    }
  }

  updateCommercial(
    projectId: string,
    commercialId: string,
    commercial: CommercialItem,
    propertyId?: string,
    buildingId?: string,
  ) {
    if (propertyId && buildingId) {
      return axios
        .patch(
          `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}`,
          commercial,
        )
        .then((response) => {
          console.log('commercial updated', response.data);
          return response.data;
        })
        .catch((error) => {
          console.error('Error updating commercial:', error);
          throw error;
        });
    } else {
      return axios
        .patch(`${this.url}/${projectId}/commercials/${commercialId}`, commercial)
        .then((response) => {
          console.log('commercial updated', response.data);
          return response.data;
        })
        .catch((error) => {
          console.error('Error updating commercial:', error);
          throw error;
        });
    }
  }

  deleteCommercial(
    projectId: string,
    commercialId: string,
    propertyId?: string,
    buildingId?: string,
  ) {
    if (propertyId && buildingId) {
      return axios
        .delete(
          `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/commercials/${commercialId}`,
        )
        .then((response) => {
          console.log('commercial deleted');
          return response.data;
        })
        .catch((error) => {
          console.error('Error deleting commercial:', error);
          throw error;
        });
    } else {
      return axios
        .delete(`${this.url}/${projectId}/commercials/${commercialId}`)
        .then((response) => {
          console.log('commercial deleted');
          return response.data;
        })
        .catch((error) => {
          console.error('Error deleting commercial:', error);
          throw error;
        });
    }
  }
}
