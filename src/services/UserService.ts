import axios from 'axios'

export default class UserService {

    private readonly host : string = import.meta.env.VITE_BACKEND_HOST;

    private readonly url : string = this.host + '/api/v1/users';

    private readonly accessToken: string;

    public constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    authenticate(userId : string) : void {
        axios.get(this.url + '/' + userId + '/authenticate',
            { headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }})
            .catch(error => console.log('Authentication failed: ' + error));
    }

    createUser(name, email) {
        return axios
            .post('http://localhost:8080/api/v2/users', {
                user_name: name,
                user_email: email
            })
            .then((response) => console.log(response))
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