<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/ProjectStore';
import NewProjectForm from "@/components/NewProjectForm.vue";
import ProjectService from "@/services/ProjectService";

interface LazyLoadEvent {
  first: number;
  rows: number;
}

export default defineComponent({
  components: { NewProjectForm },
  setup() {
    onMounted(() => {
      loading.value = true;

      lazyParams.value = {
        first: 0,
        rows: 10
      };

      loadLazyData();
    });

    const projectService = new ProjectService();

    const totalRecords = ref(0);
    const projects = ref();
    const first = ref(0);
    const lazyParams = ref<{ first: number; rows: number }>({ first: 0, rows: 10 });

    const loadLazyData = (event?: LazyLoadEvent) => {
      loading.value = true;
      if (event) {
        lazyParams.value = { ...lazyParams.value, first: event.first || first.value, rows: event.rows };
      }

      projectService.getProjects(lazyParams.value.rows, lazyParams.value.first).then((data) => {
        projects.value = data.projects;
        totalRecords.value = data.total;
        loading.value = false;
      });
    };

    const onPage = (event: LazyLoadEvent) => {
      lazyParams.value = event;
      loadLazyData(event);
    };

    const dt = ref();
    const loading = ref(false);

    const projectStore = useProjectStore();
    const router = useRouter();

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
      loadLazyData,
      projects,
      onRowClick,
      onPage,
      totalRecords,
      loading,
      dt,
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
            :value="projects"
            scrollable
            @row-click="onRowClick"
            @page="onPage($event)"
            :loading="loading"
            :rowHover="true"
            :rows="10"
            dataKey="id"
            :totalRecords="totalRecords"
            lazy
            paginator
            ref="dt"
            tableStyle="min-width: 75rem"
        >
          <Column field="name" header="Titel" style="min-width: 200px"></Column>
          <Column field="id" header="Projekt-ID" style="min-width: 200px"></Column>
          <Column field="memberRole" header="Eigentümer Rolle" style="min-width: 200px"></Column>
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
        <div style="margin-top: 1.2em">
          <NewProjectForm @abort="close" @submit="close"></NewProjectForm>
        </div>
      </Dialog>
    </div>
  </div>
</template>
