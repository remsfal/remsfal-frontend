import axios from 'axios';

export interface ProjectItem {
  id: string;
  name: string;
  memberRole: string;
}

export interface ProjectList {
  first: number;
  size: number;
  total: number;
  projects: ProjectItem[];
}

export interface Project {
  id: string;
  title: string;
}

export interface PropertyList {
  first: number;
  size: number;
  total: number;
  properties: PropertyItem[];
}

export interface PropertyItem {
  id?: string;
  title: string;
  description: string;
  landRegisterEntry: string;
  plotArea: number;
  effective_space: number;
  buildings?: BuildingItem[];
  district?: string; // Gemarkung
  corridor?: string; // Flur
  parcel?: string; // Flurstück
  landRegistry?: string; // Liegenschaftsbuch
  usageType?: string | null; // Wirtschaftsart
}

export interface BuildingItem {
  id?: string;
  propertyId: string;
  title: string;
  addressId: string;
  description: string;
  livingSpace: number;
  commercialSpace: number;
  usableSpace: number;
  heatingSpace: number;
  rent: number;
  apartments?: ApartmentItem[];
  garages?: GarageItem[];
}

export interface ApartmentItem {
  id?: string;
  buildingId: string;
  title: string;
  location: string;
  description: string;
  livingSpace: number;
  usableSpace: number;
  heatingSpace: number;
  rent: number;
}

export interface GarageItem {
  id?: string;
  buildingId: string;
  title: string;
  location: string;
  description: string;
  usableSpace: number;
  rent: number;
}

export default class ProjectService {
  private readonly url: string = '/api/v1/projects';

  getProjects(offset: number = 0, limit: number = 10): Promise<ProjectList> {
    return axios.get(this.url, { params: { limit: limit, offset: offset } }).then((response) => {
      const projectList: ProjectList = response.data;
      console.log('GET projects:', projectList);
      return projectList;
    });
  }

  createProject(title: string): Promise<Project> {
    return axios.post(`${this.url}`, { title: title }).then((response) => {
      const project: Project = response.data;
      console.log('POST create project:', project);
      return project;
    });
  }

  getProject(projectId: string) {
    return axios
      .get(`${this.url}/${projectId}`)
      .then((response) => {
        console.log('project returned', response.data);
        return response.data;
      })
      .catch((error) => {
        console.log('project retrieval error', error.request.status);

        console.error(error.request.status);
        throw error.request.status; // This will allow error to be caught where getProject is called
      });
  }

  getRole(projectId: string) {
    return axios
      .get(`${this.url}/${projectId}/role`)
      .then((response) => {
        console.log('role returned', response.data);
        return response.data;
      })
      .catch((error) => {
        console.log('role retrieval error', error.request.status);

        console.error(error.request.status);
        throw error.request.status; // This will allow error to be caught where getProject is called
      });
  }

  createProperty(projectId: string, property: PropertyItem) {
    return axios
      .post(`${this.url}/${projectId}/properties`, property)
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }

  getProperties(projectId: string, limit: number, offset: number): Promise<PropertyList> {
    return axios
      .get(`${this.url}/${projectId}/properties`, {
        params: {
          limit: limit,
          offset: offset,
          projectId: projectId,
        },
      })
      .then((response) => {
        console.log('properties returned', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  getProperty(projectId: string, propertyId: string): Promise<PropertyItem> {
    return axios
      .get(`${this.url}/${projectId}/properties/${propertyId}`)
      .then((response) => {
        console.log('property returned', response.data);
        return response.data;
      })
      .catch((error) => {
        console.error('Error getting property:', error);
        throw error;
      });
  }

  updateProperty(
    projectId: string,
    propertyId: string,
    property: PropertyItem,
  ): Promise<PropertyItem> {
    return axios
      .patch(`${this.url}/${projectId}/properties/${propertyId}`, property)
      .then((response) => {
        console.log('property updated', response.data);
        return response.data;
      })
      .catch((error) => {
        console.error('Error updating property:', error);
        throw error;
      });
  }

  deleteProperty(projectId: string, propertyId: string): Promise<void> {
    return axios
      .delete(`${this.url}/${projectId}/properties/${propertyId}`)
      .then((response) => {
        console.log('property deleted');
        return response.data;
      })
      .catch((error) => {
        console.error('Error deleting property:', error);
        throw error;
      });
  }

  createSite(title: string, projectId: string, propertyId: string) {
    return axios
      .post(`${this.url}/${projectId}/properties/${propertyId}/sites`, {
        title: title,
        propertyId: propertyId,
      })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }

  getSites(projectId: string, propertyId: string) {
    return axios
      .get(`${this.url}/${projectId}/properties/${propertyId}/sites`)
      .then((response) => {
        console.log('properties returned', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  createBuilding(title: string, projectId: string, propertyId: string) {
    return axios
      .post(`${this.url}/${projectId}/properties/${propertyId}/buildings`, {
        title: title,
        propertyId: propertyId,
      })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }

  getBuildings(projectId: string, propertyId: string) {
    return axios
      .get(`${this.url}/${projectId}/properties/${propertyId}/buildings`)
      .then((response) => {
        console.log('properties returned', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  createApartment(title: string, projectId: string, propertyId: string, buildingId: string) {
    return axios
      .post(
        `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/apartments`,
        { title: title, buildingId: buildingId },
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }

  getApartments(projectId: string, propertyId: string, buildingId: string) {
    return axios
      .get(`${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/apartments`)
      .then((response) => {
        console.log('properties returned', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  createGarage(title: string, projectId: string, propertyId: string, buildingId: string) {
    return axios
      .post(`${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/garages`, {
        title: title,
        buildingId: buildingId,
      })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }

  getGarages(projectId: string, propertyId: string, buildingId: string) {
    return axios
      .get(`${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/garages`)
      .then((response) => {
        console.log('properties returned', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  getMembers(projectId: string) {
    return axios
      .get(`${this.url}/${projectId}/members`)
      .then((response) => {
        console.log('properties returned', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  updateMember(projectId: string, memberId: string, role: string, email: string) {
    return axios
      .patch(`${this.url}/${projectId}/members/${memberId}`, {
        role: role,
        id: memberId,
        email: email,
      })
      .then((response) => {
        console.log('member updated', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  deleteMember(projectId: string, memberId: string) {
    console.log('deleteProjectMember', projectId, memberId);
    return axios
      .delete(`${this.url}/${projectId}/members/${memberId}`)
      .then((response) => {
        console.log('member deleted');
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  addMember(projectId: string, email: string, role: string) {
    console.log('addMember', projectId);

    const payload = {
      email: email,
      role: role,
    };

    return axios
      .post(`${this.url}/${projectId}/members`, payload)
      .then((response) => {
        console.log('member added', response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }
}
