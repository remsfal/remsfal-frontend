<template>
  <div>
    <header>
      <Menubar :model="items">
        <template #start>
          <div @click="$router.push('/')">
            <img alt="logo" src="@/assets/logo.png" height="30" class="logo"/>
          </div>
        </template>
      </Menubar>
    </header>
  </div>
</template>

<style scoped>
.logo {
  margin-left: 20px;
  margin-right: 30px;
}
</style>

<script lang="ts">
import { useRouter } from 'vue-router'
import {useUserSessionStore} from "@/stores/userSession";
import UserService from "@/services/UserService";
import ProjectService, {Project, ProjectList} from "@/services/ProjectService";

const router = useRouter();
let selectedProject: "Projekt auswählen";
let userEmail: string;

export default {
  data() {
    return {
      items: [],
      loggedInItems: [
        {
          label: () => selectedProject,
          icon: "pi pi-fw pi-home",
          items: [
            {
              label: "Neues Projekt",
              icon: "pi pi-fw pi-plus",
              to: {name: "NewProject"},
            },
          ],
        },
        {
          label: () => userEmail,
          icon: "pi pi-fw pi-user",
          items: [
            {
              label: "Kontoeinstellungen",
              icon: "pi pi-fw pi-user-edit",
              to: {name: "AccountSettings"},
            },
            {
              label: "Meine Kontakte",
              icon: "pi pi-fw pi-users",
              to: {name: "AccountContacts"},
            },
            {
              label: "Abmelden",
              icon: "pi pi-fw pi-sign-out",
              command: () => this.logout(),
            },
            {
              label: "Konto löschen",
              icon: "pi pi-fw pi-trash",
              command: () => this.deleteAccount(),
            },
          ],
        },
      ],
      loggedOutItems: [
        {
          label: "Anmeldung",
          icon: "pi pi-fw pi-sign-in",
          command: () => this.login(),
        },
      ],
    };
  },
  mounted() {
    console.log("Init header menu.");
    const sessionStore = useUserSessionStore();
    sessionStore.$subscribe((mutation, state) => {
      this.updateLoginState(state.userEmail);
    })
    // And update the initial state
    this.updateLoginState(sessionStore.userEmail);
  },
  methods: {
    login(): void {
      window.location.pathname = "/api/v1/authentication/login";
    },
    logout(): void {
      window.location.pathname = "/api/v1/authentication/logout";
    },
    updateLoginState(email: string) {
      if (email !== null) {
        userEmail = email;
        this.items = this.loggedInItems;
        this.updateProjectItems();
      } else {
        this.items = this.loggedOutItems;
      }
    },
    updateProjectItems() {
      const projectService = new ProjectService();
      projectService.getProjects()
          .then((projectList: ProjectList) => {
            const projectItems = [
              {
                label: "Neues Projekt",
                icon: "pi pi-fw pi-plus",
                to: {name: "NewProject", params: {projectId: "default"}},
              },
            ];

            for (let project: Project of projectList.projects) {
              projectItems.push({
                label: project.title,
                icon: "pi pi-fw pi-external-link",
                to: {name: "Project", params: {projectId: project.id}},
              });
            }

            this.items[0].items = projectItems;
          })
          .catch((error) => {
            // Handle the error here
            console.error("An error occurred while fetching projects:", error);
          });
      this.items = this.loggedInItems;
    },
    deleteAccount() {
      const userService = new UserService();
      userService.deleteUser()
          .then(() => this.logout())
          .catch(() => console.error("Unable to delete this account!"))
    },
  },
};
</script>
