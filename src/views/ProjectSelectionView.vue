<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';

import ProjectService, {type Project} from "@/services/ProjectService"

export default defineComponent({
  setup() {
    const projectStore = useProjectStore();
    const router = useRouter();

    const projectList = computed(() => {
      const roles = {
        PROPRIETOR: "Eigentuemer",
        MANAGER: "Verwalter",
        LESSOR: "Vermieter"
      };

      return projectStore.projectList.map(project => ({
        ...project,
        memberGerman: roles[project.memberRole]
      }));
    });

    const onRowClick = (event: any) => {
      const projectId = event.data.id;
      
      projectStore.setSelectedProject(event.data);
      router.push(`/project/${projectId}`);
    };

    const display = ref(false);

    const open = () => {
      display.value = true;
    };

    const close = () => {
      display.value = false;
    };

    return {
      projectList,
      onRowClick,
      display,
      open,
      close,
    };
  },

  data() {
    return {
      projectTitle: "",
      errorMessage: "Der Projekttitel darf nicht mehr als 250 Zeichen lang sein",
    };
  },
  methods: {
    createProject() {
      const projectService = new ProjectService();
      const projectStore = useProjectStore();
      // Now project_title will contain the value emitted from the pressedButton event
      projectService
          .createProject(this.projectTitle)
          .then((newProject: Project) => {
            console.info("new project has been created: ", newProject);
            this.close()
            projectStore.refreshProjectList()
          })
    }
  },
});
</script>

<template>
  <div class="grid">
    <div class="col-10">
      <div class="card">
        <h5>Projekt Übersicht</h5>
        <DataTable
            :value="projectList"
            sortMode="single"
            sortField="title"
            :sortOrder="1"
            scrollable
            scrollHeight="400px"
            @row-click="onRowClick"
            :rowHover="true"
            :paginator="true"
            :rows="10"
        >
          <Column field="name" header="Titel" style="min-width: 200px"></Column>
          <Column field="id" header="Projekt-ID" style="min-width: 200px"></Column>
          <Column field="memberGerman" header="Eigentümer Rolle" style="min-width: 200px"></Column>
        </DataTable>
      </div>
    </div>
    <div class="col-2">
      <Button label="Projekt hinzufügen" icon="pi pi-plus" style="width: auto" @click="open" />
      <Dialog
          header="Projekt hinzufügen"
          v-model:visible="display"
          :breakpoints="{ '960px': '75vw' }"
          :style="{ width: '30vw' }"
          :modal="true"
      >
        <form @submit.prevent="createProject" class="flex flex-column gap-2">
            <span class="p-float-label">
                <InputText id="value" v-model="projectTitle" type="text" :class="{ 'p-invalid': errorMessage }" aria-describedby="text-error" />
                <label for="value">Projekttitel</label>
            </span>
          <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
          <Button type="submit" label="Erstellen" icon="pi pi-plus" iconPos="left"/>
          <Button
              @click="close"
              type="reset"
              label="Abbrechen"
              icon="pi pi-times"
              iconPos="left"
          />
        </form>
      </Dialog>
    </div>
  </div>
</template>
