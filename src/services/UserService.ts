import axios from 'axios'
import AuthenticationService from "@/services/AuthenticationService";

export default class UserService {
  private readonly url: string = "/api/v1/users";
  private authenticated: boolean = false;

  private readonly idToken: string;

  public constructor(idToken: string) {
    this.idToken = idToken;
  }
  authenticate(){
    return axios
        .get(`${this.url}/authenticate`, {
          headers: {
            Authorization: `Bearer ${this.idToken}`,
          },
        })
        .then((response) => {
          const responseString = JSON.stringify(response.data);
          console.log("Authentication successful: " + responseString);
          this.authenticated = true;
          return this.authenticated;

        })
        .catch((error) => {
          console.log("Authentication failed: " + error);
          this.authenticated = false;
        console.error(error.request.status);
        throw error.request.status;
        });
  }

  updateUser(id: string, name: string, email: string) {
    return axios
      .patch(`${this.url}/${id}`, {
        user_name: name,
        user_email: email,
      })
      .then((response) => console.log(response));
  }
  deleteUser(id: string) {
    return axios
      .delete(`${this.url}/${id}`, {
        headers: {
          Authorization: `Bearer ${this.idToken}`,
        },
      })
      .then((response) => console.log(response))
      .catch((error) => console.error(error));
  }
}