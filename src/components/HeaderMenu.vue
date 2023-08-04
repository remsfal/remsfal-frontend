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

export default {
  props: {
    userEmail: String,
    projects: Array,
    loggedIn: Boolean,
  },
  projectService: null,

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
    updateProjectItems() {
      let projectItems = [];
      projectItems.push({
        label: "Neues Projekt",
        icon: "pi pi-fw pi-plus",
        to: { name: "NewProject" },
      });
  this.items = this.loggedInItems;

if (this.loggedIn && Array.isArray(this.projects)) {
  const projectItems = [            {
              label: "Neues Projekt",
              icon: "pi pi-fw pi-plus",
              to: { name: "NewProject" },
            }];

  for (let project of this.projects) {
    projectItems.push({
      label: project.title,
      icon: "pi pi-fw pi-external-link",
      to: { name: "Project", params: { projectId: project.id } },
    });
  }

  this.items[0].items = projectItems;
}

      if (!this.loggedIn) {
        this.items = this.loggedOutItems;
      }
    },
    updateHeaderMenuItems() {
    },
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
