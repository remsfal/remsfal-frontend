import {defineStore} from 'pinia'
import axios from 'axios'

interface UserInfo {
    id: string;
    email: string;
}

export const useUserSessionStore = defineStore('user-session', {
    state: () => {
        return {
            userId: null as String,
            userEmail: null as String
        }
    },
    actions: {
        refreshSessionState() {
            axios
                .get("/api/v1/user")
                .then((response) => {
                    let user: UserInfo = response.data;
                    console.log("Active user session: " + user);
                    this.userId = user.id;
                    this.userEmail = user.email;
                })
                .catch((error) => {
                    console.log("Invalid user session: " + error);
                    if (401 === error.response.status) {
                        this.userId = null;
                        this.userEmail = null;
                    }
                });
        },
    },
})