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
          ],
        },

      ],
      loggedOutItems: [
        {
          label: "Registrieren",
          icon: "pi pi-fw pi-user-plus",
          command: () => this.openRegister(),
        },
        {
          label: "Log-In",
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
      console.log("currentloggedIn", this.loggedIn);
      if (this.loggedIn) {
        this.items = this.loggedInItems;
        this.items[0].items = [
          {
            label: "Neues Projekt",
            icon: "pi pi-fw pi-plus",
            to: { name: "NewProject" },
          },
          {
            separator: true,
          },
          {
            label: "Mein Super Projekt Berliner Str. 12, 13507 Berlin",
            icon: "pi pi-fw pi-external-link",
            to: { name: "Project", params: { projectId: "1" } },
          },
          {
            label: "Noch ein besseres Projekt Berliner Str. 15, 13507 Berlin",
            icon: "pi pi-fw pi-external-link",
            to: { name: "Project", params: { projectId: "2" } },
          },
        ];
      }
      if (!this.loggedIn) {
        this.items = this.loggedOutItems;
      }
    },
    handleLoginClick() {
      this.$emit("clickedLogin");
    },
    handleLogoutClick() {
      this.$emit("clickedLogout");
    },
    openRegister() {
      this.$emit("clickedRegister");
    },
  },
  watch: {
    loggedIn: function (newVal, oldVal) {
      console.log("loggedIn changed from", oldVal, "to", newVal);
      this.updateProjectItems();
    },
  },
};
</script>
