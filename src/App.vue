<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<script lang="ts">
import AuthenticationService from "@/services/AuthenticationService";
import UserService from "@/services/UserService";
import ProjectService from "@/services/ProjectService";

export default {
  data() {
    return {
      userId: '',
      userEmail: '',
      accessToken: '',
      items: [
        {
          label: 'Projekt auswählen',
          icon: 'pi pi-fw pi-home',
          items: [
            {
              label: 'Neues Projekt',
              icon: 'pi pi-fw pi-plus',
              to: {name: 'NewProject'}
            }
          ]
        },
        {
          label:() => this.userEmail,
          icon: 'pi pi-fw pi-user',
          items: [
            {
              label: 'Kontoeinstellungen',
              icon: 'pi pi-fw pi-user-edit',
              to: {name: 'AccountSettings'}
            },
            {
              label: 'Meine Kontakte',
              icon: 'pi pi-fw pi-users',
              to: {name: 'AccountContacts'}
            }
          ]
        },
        {
          label: 'Abmelden',
          icon: 'pi pi-fw pi-sign-out',
          url: 'https://remsfal.de'
        }
      ]
    };
  },
  userService: null,
  projectService: null,
  authenticationService: AuthenticationService.getInstance(),
  created() {
    // authenticate with Google
    this.authenticationService = AuthenticationService.getInstance();
    this.accessToken = this.authenticationService.getAccessToken();
    // init backend services
    this.userService = new UserService(this.accessToken);
    this.projectService = new ProjectService();
    // update user info
    this.authenticationService.getUserId()
        .then(userId => {
          this.userId = userId;
          // authenticate at backend
          this.userService.authenticate(userId);
        });
    this.authenticationService.getUserEmail()
        .then(userEmail => this.userEmail = userEmail);
  },
  mounted() {
    this.updateProjectItems();
  },
  methods: {
    updateProjectItems() {
      console.log("update item ");
      this.items[0].items =
          [
                {
                  label: 'Neues Projekt',
                  icon: 'pi pi-fw pi-plus',
                  to: {name: 'NewProject'}
                },
                {
                  separator: true
                },
                {
                  label: 'Mein Super Projekt Berliner Str. 12, 13507 Berlin',
                  icon: 'pi pi-fw pi-external-link',
                  to: {name: 'Project', params: { projectId: "1" }}
                },
                {
                  label: 'Noch ein besseres Projekt Berliner Str. 15, 13507 Berlin',
                  icon: 'pi pi-fw pi-external-link',
                  to: {name: 'Project', params: { projectId: "2" }}
                }
          ]
    },
    onProjectCreated() {
      console.log("Project created event");
      this.updateProjectItems();
    }
  }
};
</script>

<template>
  <header>
    <div class="card">
      <Menubar :model="items">
        <template #start>
          <img alt="logo" src="@/assets/logo.png" height="30" class="logo" />
        </template>
      </Menubar>
    </div>
  </header>

  <RouterView @projectCreated="onProjectCreated"/>
</template>

<style scoped>
/**
.p-menubar {
  background: #4CAF50;
}
*/
.logo {
  margin-left: 20px;
  margin-right: 30px;
}

</style>
