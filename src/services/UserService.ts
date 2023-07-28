import axios from 'axios'
import AuthenticationService from "@/services/AuthenticationService";

export default class UserService {
  private readonly host: string = import.meta.env.VITE_BACKEND_HOST;

  private readonly url: string = this.host + "/api/v1/users";
  private authenticated: boolean = false;

  private readonly idToken: string;

  public constructor(idToken: string) {
    this.idToken = idToken;
  }
  // rest of the code...
  authenticate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      axios
        .get(`${this.url}/authenticate`, {
          headers: {
            Authorization: `Bearer ${this.idToken}`,
          },
        })
        .then((response) => {
          console.log("Authentication succeeded: " + response);
          this.authenticated = true;
          resolve(this.authenticated); // Resolve promise with authenticated status
        })
        .catch((error) => {
          console.log("Authentication failed: " + error);
          this.authenticated = false;

          reject(error); // Reject promise with error
        });
    });
  }

  updateUser(id, name, email) {
    return axios
      .patch(`${this.url}/${id}`, {
        user_name: name,
        user_email: email,
      })
      .then((response) => console.log(response));
  }

  deleteUser(id) {
    return axios
      .delete(`${this.url}/${id}`)
      .then((response) => console.log(response));
  }
}