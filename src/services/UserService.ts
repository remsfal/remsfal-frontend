import axios from 'axios'

export default class UserService {

    private readonly host : string = import.meta.env.VITE_BACKEND_HOST;

    private readonly url : string = this.host + '/api/v1/users';

    private readonly idToken: string;

    public constructor(idToken: string) {
        this.idToken = idToken;
    }

    authenticate(userId : string) : void {
        axios
          .get(`${this.url}/${userId}/authenticate`, {
            headers: {
              Authorization: `Bearer ${this.idToken}`,
            },
          })
          .catch((error) => console.log("Authentication failed: " + error));
      this.createUser("John Dee", "johndoee@example.com");

          }

    createUser(name, email) {
        return axios
          .post(
            `${this.url}`,
            {
              name: name,
              email: email,
            },
            {
              headers: {
                Authorization: `Bearer ${this.idToken}`,
              },
            }
          )
          .then((response) => console.log(response));
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