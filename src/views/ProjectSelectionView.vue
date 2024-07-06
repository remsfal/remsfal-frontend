<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import ProjectService, { type Project } from "@/services/ProjectService";

export default defineComponent({
  setup() {
    const projectStore = useProjectStore();
    const router = useRouter();

    const projectList = computed(() => {
      const roles: Record<'PROPRIETOR' | 'MANAGER' | 'LESSOR', string> = {
        PROPRIETOR: "Eigentuemer",
        MANAGER: "Verwalter",
        LESSOR: "Vermieter",
      };

      return projectStore.projectList.map((project) => ({
        ...project,
        memberGerman: roles[project.memberRole as 'PROPRIETOR' | 'MANAGER' | 'LESSOR'],
      }));
    });

    const onRowClick = (event: any) => {
      projectStore.setSelectedProject(event.data);
      router.push({ name: "ProjectDashboard", params: { projectId: projectStore.projectId } });
    };

    const display = ref(false);
    const projectTitle = ref("");
    const errorMessage = ref("");
    const maxLength = 100;

    const open = () => {
      display.value = true;
      errorMessage.value = "";
      projectTitle.value = "";
    };

    const close = () => {
      display.value = false;
    };

    const createProject = () => {
      const projectService = new ProjectService();

      if (projectTitle.value.length > maxLength) {
        errorMessage.value = `Der Projekttitel darf nicht mehr als ${maxLength} Zeichen lang sein`;
        return;
      }

      projectService.createProject(projectTitle.value).then((newProject: Project) => {
        console.info("new project has been created: ", newProject);
        router.push({ name: "ProjectDashboard", params: { projectId: newProject.id } });
      });
    };

    watch(projectTitle, (newVal) => {
      if (newVal.length > maxLength) {
        errorMessage.value = `Der Projekttitel darf nicht mehr als ${maxLength} Zeichen lang sein`;
      } else {
        errorMessage.value = "";
      }
    });

    return {
      projectList,
      onRowClick,
      display,
      open,
      close,
      projectTitle,
      errorMessage,
      createProject,
    };
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
            scrollable
            scrollHeight="500px"
            @row-click="onRowClick"
            :rowHover="true"
            :paginator="true"
            :rows="10"
        >
          <Column field="name" header="Titel" sortable style="min-width: 200px"></Column>
          <Column field="id" header="Projekt-ID" sortable style="min-width: 200px"></Column>
          <Column field="memberGerman" header="Eigentümer Rolle" sortable style="min-width: 200px"></Column>
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
        <form @submit.prevent="createProject" class="flex flex-column gap-2 w-23rem">
          <span class="p-float-label">
            <InputText
                id="value"
                v-model="projectTitle"
                type="text"
                :class="{ 'p-invalid': errorMessage }"
                aria-describedby="text-error"
            />
            <label for="value">Projekttitel</label>
          </span>
          <small class="p-error" id="text-error">{{ errorMessage || "&nbsp;" }}</small>
          <Button type="submit" label="Erstellen" icon="pi pi-plus" iconPos="left" />
          <Button @click="close" type="reset" label="Abbrechen" icon="pi pi-times" iconPos="left" />
        </form>
      </Dialog>
    </div>
  </div>
</template>
