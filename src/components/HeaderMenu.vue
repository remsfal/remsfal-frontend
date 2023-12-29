<script setup lang="ts">
import Menubar from 'primevue/menubar';
</script>

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
import {useUserSessionStore, type UserInfo} from "@/stores/userSession";
import UserService from "@/services/UserService";
import ProjectService, {type Project, type ProjectList} from "@/services/ProjectService";
// workaround of https://github.com/primefaces/primevue/issues/3498
import type {MenuItem} from "@/../node_modules/primevue/menuitem/MenuItem"

let selectedProject: "Projekt auswählen";
let userEmail: string;

const defaultItems: MenuItem[] = [
  {
    label: "Anmeldung",
    icon: "pi pi-fw pi-sign-in",
  },
]

export default {
  data() {
    return {
      items: defaultItems,
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
      this.updateLoginState(state.user);
    })
    // And update the initial state
    this.updateLoginState(sessionStore.user);
  },
  methods: {
    login(): void {
      window.location.pathname = "/api/v1/authentication/login";
    },
    logout(): void {
      window.location.pathname = "/api/v1/authentication/logout";
    },
    updateLoginState(user: UserInfo | null) {
      if (user !== null) {
        userEmail = user.email;
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
            const projectItems: MenuItem[] = [
              {
                label: "Neues Projekt",
                icon: "pi pi-fw pi-plus",
                to: {name: "NewProject"},
              },
            ];

            for (let project of projectList.projects) {
              projectItems.push({
                label: project.title,
                icon: "pi pi-fw pi-external-link",
                to: {name: "Project", params: {projectId: project.id}},
              });
            }

            const projectMenu: MenuItem = {
              label: () => selectedProject,
              icon: "pi pi-fw pi-home",
              items: projectItems,
            };
            this.items[0] = projectMenu;
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
