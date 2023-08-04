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
}
