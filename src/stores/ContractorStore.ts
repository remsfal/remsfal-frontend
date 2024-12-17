import { defineStore } from 'pinia';
import ContractorService, {type TaskListJson, type TaskItemJson} from '@/services/ContractorService';


export const useContractorStore = defineStore('contractor-store', {
  state: () => {
    return {
      tasks: <TaskItemJson[]>[],
      selectedTask: null as TaskItemJson | null,
      totalTasks: Number(0),
    };
  },
  getters: {
    taskList: (state) => state.tasks,
    taskSelection: (state) => state.selectedTask,
    taskId: (state) => state.selectedTask!.id,
  },
  actions: {
    refreshTaskList(ownerId: string) {
      const contractorService = new ContractorService();
      contractorService
        .getTasks(ownerId)
        .then((taskList: TaskListJson) => {
          this.tasks = taskList.tasks;
          this.totalTasks = taskList.tasks.length;
          console.log('Refreshed task list: ', this.tasks);
        })
        .catch((error) => {
          console.error('An error occurred while refreshing tasks:', error);
        });
    },
    fetchProjects(ownerId: string): Promise<void> {
      const contractorService = new ContractorService();
      return contractorService
        .getTasks(ownerId)
        .then((taskList: TaskListJson) => {
          this.tasks = taskList.tasks;
          this.totalTasks = taskList.tasks.length;
          console.log('Fetched task list: ', this.tasks);
        })
        .catch((error) => {
          console.error('An error occurred while fetching tasks:', error);
        });
    },
    setSelectedTask(selection: TaskItemJson) {
      this.selectedTask = selection;
      console.log('Task selection changed: ', this.selectedTask);
    },
  },
});