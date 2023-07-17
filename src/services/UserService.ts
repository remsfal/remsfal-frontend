import axios from 'axios'

export default class UserService {

    private readonly host : string = import.meta.env.VITE_BACKEND_HOST;

    private readonly url : string = this.host + '/api/v1/users';

    private readonly idToken: string;
    private readonly accessToken: string;

    public constructor(idToken: string, accessToken: string) {
        this.idToken = idToken;
        this.accessToken = accessToken;
    }

    authenticate(userId : string) : void {
      console.log('idToken: ' + this.idToken)
        axios.get(this.url + '/' + userId + '/authenticate',
            { headers: {
                    'Authorization': `Bearer ${this.idToken}`
                }})
            .catch(error => console.log('Authentication failed: ' + error));
      this.createUser("John Dee", "johndoee@example.com");

          }

    createUser(name, email) {
        return axios
          .post(
            "http://localhost:8080/api/v1/users",
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
            .patch('http://localhost:8080/api/v2/users/' + id, {
                user_name: name,
                user_email: email
            })
            .then((response) => console.log(response))
    }

    deleteUser(id) {
        return axios
            .delete('http://localhost:8080/api/v2/users/' + id)
            .then((response) => console.log(response))
    }
}