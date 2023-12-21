import axios from 'axios'

interface User {
    id: string;
    name: string;
    email: string;
    registeredDate: string;
    lastLoginDate: string;
}

export default class UserService {
    private readonly url: string = "/api/v1/user";

    getUser(): Promise<User | void> {
        return axios
            .get(`${this.url}`)
            .then((response) => {
                let user: User = response.data;
                console.log("GET user:", user);
                return user;
            })
            .catch((error) => {
                console.error("GET user failed:", error);
            });
    }

    updateUser(name: string): Promise<User | void> {
        return axios
            .patch(`${this.url}`, {
                name: name,
            })
            .then((response) => {
                let user: User = response.data;
                console.log("PATCH user:", user);
                return user;
            })
            .catch((error) => {
                console.error("PATCH user failed:", error);
            });
    }

    deleteUser(): Promise<boolean> {
        return axios
            .delete(`${this.url}`)
            .then(() => {
                console.log("DELETE user");
                return true;
            })
            .catch((error) => {
                console.error("DELETE user failed:", error);
                return false;
            });
    }
}