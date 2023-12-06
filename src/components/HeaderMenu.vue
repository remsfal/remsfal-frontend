<template>
  <div>
    <header>
      <Menubar :model="items">
        <template #start>
          <div @click="$router.push('/')">
            <img alt="logo" src="@/assets/logo.png" height="30" class="logo" />
          </div>
        </template>
      </Menubar>
      <Modal></Modal>
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
import AuthenticationService from "@/services/AuthenticationService";
import ProjectService from "@/services/ProjectService";

export default {
  props: {
    userEmail: String,
    loggedIn: Boolean,
  },
  projectService: null,
  projects: [],

  data() {
    return {
      selectedProject: "Projekt auswählen",
      items: [],
      loggedInItems: [
        {
          label: () => this.selectedProject,
          icon: "pi pi-fw pi-home",
          items: [
            {
              label: "Neues Projekt",
              icon: "pi pi-fw pi-plus",
              to: { name: "NewProject" },
            },
          ],
        },
        {
          label: () => this.userEmail,
          icon: "pi pi-fw pi-user",
          items: [
            {
              label: "Kontoeinstellungen",
              icon: "pi pi-fw pi-user-edit",
              to: { name: "AccountSettings" },
            },
            {
              label: "Meine Kontakte",
              icon: "pi pi-fw pi-users",
              to: { name: "AccountContacts" },
            },
            {
              label: "Abmelden",
              icon: "pi pi-fw pi-sign-out",
              command: () => this.handleLogoutClick(),
            },
            {
              label: "Konto löschen",
              icon: "pi pi-fw pi-trash",
              command: () => this.handleDeleteClick(),
            },
          ],
        },
      ],
      loggedOutItems: [
        {
          label: "Anmeldung",
          icon: "pi pi-fw pi-sign-in",
          command: () => this.handleLoginClick(),
        },
      ],
    };
  },
  mounted() {
    this.updateProjectItems();
  },
  methods: {
    async updateProjectItems() {
  if(this.loggedIn){
      const authenticationService = AuthenticationService.getInstance();
      await authenticationService.whenTokenReady();
      const idToken = authenticationService.getIdToken();
      const projectService = new ProjectService(idToken);
      projectService
        .getProjects()
        .then((data) => {
          const projectItems = [
            {
              label: "Neues Projekt",
              icon: "pi pi-fw pi-plus",
              to: { name: "NewProject" },
            },
          ];

          for (let project of data) {
            projectItems.push({
              label: project.title,
              icon: "pi pi-fw pi-external-link",
              to: { name: "Project", params: { projectId: project.id } },
            });
          }

          this.items[0].items = projectItems;
        })
        .catch((error) => {
          // Handle the error here
          console.error("An error occurred while fetching projects:", error);
          // You may want to initialize this.projects to an empty array or handle the error differently
          this.projects = [];
        });
      let projectItems = [];
      projectItems.push({
        label: "Neues Projekt",
        icon: "pi pi-fw pi-plus",
        to: { name: "NewProject" },
      });
      this.items = this.loggedInItems;
}
      if (!this.loggedIn) {
        this.items = this.loggedOutItems;
      }
    },
    updateHeaderMenuItems() {},
    handleLoginClick() {
      this.$emit("clickedLogin");
    },
    handleLogoutClick() {
      this.$emit("clickedLogout");
    },
    handleDeleteClick() {
      this.$emit("clickedDelete");
    },
  },
  watch: {
    loggedIn: function (newVal, oldVal) {
      this.updateProjectItems();
      this.updateHeaderMenuItems();
    },
  },
};
</script>
