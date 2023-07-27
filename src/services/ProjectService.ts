import axios from "axios";
import AuthenticationService from "@/services/AuthenticationService";

export default class ProjectService {
  private authenticationService: any;
  private readonly idToken: string;

  public constructor() {
    this.authenticationService = AuthenticationService.getInstance();
    this.idToken = this.authenticationService.getIdToken();
    console.log("ProjectService constructor", this.idToken);
  }

  createProject(title: string) {
    return axios
      .post(
        "http://localhost:8080/api/v1/projects",
        { project_title: "title" },
        { headers: { Authorization: `Bearer ${this.idToken}` } }
      )
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
}
