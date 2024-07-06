<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import NewProjectForm from "@/components/NewProjectForm.vue";

export default defineComponent({
  components: {NewProjectForm},
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
      close
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
        <div style="margin-top: 1.5em">
          <NewProjectForm @abort="close"></NewProjectForm>
        </div>
      </Dialog>
    </div>
  </div>
</template>
