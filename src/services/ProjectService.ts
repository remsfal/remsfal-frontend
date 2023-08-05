import axios from "axios";
import AuthenticationService from "@/services/AuthenticationService";

export default class ProjectService {
  private authenticationService: any;
  private readonly host: string = import.meta.env.VITE_BACKEND_HOST;

  private readonly url: string = this.host + "/api/v1/projects";
  private readonly idToken: string;

  public constructor(idToken: string) {
    this.idToken = idToken;
  }
  createProject(title: string) {
    console.log(`Bearer ${this.idToken}`);
    return axios
      .post(
        `${this.url}`,
        { title: title },
        { headers: { Authorization: `Bearer ${this.idToken}` } }
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
  getProjects() {
    console.log("getProjects ", this.idToken);
    return axios
      .get(`${this.url}`, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("projects returned", response.data.projects);
        return response.data.projects;
      })
      .catch((error) => console.error(error));
  }
  getProject(projectId: string) {
    console.log("getProject ", projectId, " ", this.idToken);
    return axios
      .get(`${this.url}/${projectId}`, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("project returned", response.data);
        return response.data;
      })
      .catch((error) => {
        console.log("project retreival error", error.request.status);

        console.error(error.request.status);
        throw error.request.status; // This will allow error to be caught where getProject is called
      });
  }
  createProperty(title: string, projectId: string) {
    console.log(`Bearer ${this.idToken}`);
    return axios
      .post(
        `${this.url}/${projectId}/properties`,
        { title: title, projectId: projectId },
        { headers: { Authorization: `Bearer ${this.idToken}` } }
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
  getProperties(projectId: string) {
    console.log("getProperties ", this.idToken);
    return axios
      .get(`${this.url}/${projectId}/properties`, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("properties returned", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }
  createSite(title: string, projectId: string, propertyId: string) {
    console.log(`Bearer ${this.idToken}`);
    return axios
      .post(
        `${this.url}/${projectId}/properties/${propertyId}/sites`,
        { title: title, propertyId: propertyId },
        { headers: { Authorization: `Bearer ${this.idToken}` } }
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
  getSites(projectId: string, propertyId: string) {
    console.log("getProperties ", this.idToken);
    return axios
      .get(`${this.url}/${projectId}/properties/${propertyId}/sites`, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("properties returned", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }
  createBuilding(
    title: string,
    projectId: string,
    propertyId: string,
    siteId: string
  ) {
    console.log(`Bearer ${this.idToken}`);
    return axios
      .post(
        `${this.url}/${projectId}/properties/${propertyId}/buildings`,
        { title: title, propertyId: propertyId },
        { headers: { Authorization: `Bearer ${this.idToken}` } }
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
  getBuildings(projectId: string, propertyId: string, siteId: string) {
    console.log("getProperties ", this.idToken);
    return axios
      .get(`${this.url}/${projectId}/properties/${propertyId}/buildings`, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("properties returned", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }
  createApartment(
    title: string,
    projectId: string,
    propertyId: string,
    buildingId: string
  ) {
    console.log(`Bearer ${this.idToken}`);
    return axios
      .post(
        `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/apartments`,
        { title: title, buildingId: buildingId },
        { headers: { Authorization: `Bearer ${this.idToken}` } }
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
  getApartments(projectId: string, propertyId: string, buildingId: string) {
    console.log("getProperties ", this.idToken);
    return axios
      .get(
        `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/apartments`,
        {
          headers: { Authorization: `Bearer ${this.idToken}` },
        }
      )
      .then((response) => {
        console.log("properties returned", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }
  createGarage(
    title: string,
    projectId: string,
    propertyId: string,
    buildingId: string
  ) {
    console.log(`Bearer ${this.idToken}`);
    return axios
      .post(
        `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/garages`,
        { title: title, buildingId: buildingId },
        { headers: { Authorization: `Bearer ${this.idToken}` } }
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
  getGarages(projectId: string, propertyId: string, buildingId: string) {
    console.log("getProperties ", this.idToken);
    return axios
      .get(
        `${this.url}/${projectId}/properties/${propertyId}/buildings/${buildingId}/garages`,
        {
          headers: { Authorization: `Bearer ${this.idToken}` },
        }
      )
      .then((response) => {
        console.log("properties returned", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  getMembers(projectId: string) {
    console.log("getProperties ", this.idToken);
    return axios
      .get(`${this.url}/${projectId}/members`, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("properties returned", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  updateMember(projectId, memberId, projectMemberInfo) {
    console.log("updateProjectMember", projectId, memberId);
    return axios
      .patch(
        `${this.url}/${projectId}/members/${memberId}`,
        projectMemberInfo,
        {
          headers: { Authorization: `Bearer ${this.idToken}` },
        }
      )
      .then((response) => {
        console.log("member updated", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  deleteMember(projectId, memberId) {
    console.log("deleteProjectMember", projectId, memberId);
    return axios
      .delete(`${this.url}/${projectId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("member deleted");
        return response.data;
      })
      .catch((error) => console.error(error));
  }

  addMember(projectId, email, role) {
    console.log("addMember", projectId);

    const payload = {
      email: email,
      role: role,
    };

    return axios
      .post(`${this.url}/${projectId}/members`, payload, {
        headers: { Authorization: `Bearer ${this.idToken}` },
      })
      .then((response) => {
        console.log("member added", response.data);
        return response.data;
      })
      .catch((error) => console.error(error));
  }
}
