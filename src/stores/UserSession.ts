import {defineStore} from 'pinia'
import axios from 'axios'

export interface UserInfo {
    id: string;
    email: string;
}

export const useUserSessionStore = defineStore('user-session', {
    state: () => {
        return {
            user: null as UserInfo | null
        }
    },
    actions: {
        refreshSessionState() {
            axios
                .get("/api/v1/user")
                .then((response) => {
                    this.user = response.data;
                    console.log("Active user session: ", this.user);
                })
                .catch((error) => {
                    console.log("Invalid user session: ", error);
                    if (401 === error.response.status) {
                        this.user = null;
                    }
                });
        },
    },
})