import { defineStore } from 'pinia';
import ContractorService, {type ContractorList, type ContractorItem} from '@/services/ContractorService';


export const useContractorStore = defineStore('contractor-store', {
  state: () => {
    return {
      tasks: <ContractorItem[]>[],
      selectedTask: null as ContractorItem | null,
      totalTasks: Number(0),
      firstOffset: Number(0),
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
        .then((taskList: ContractorList) => {
          this.tasks = taskList.contractors;
          this.totalTasks = taskList.total;
          this.firstOffset = taskList.first;
          console.log('Refreshed task list: ', this.tasks);
        })
        .catch((error) => {
          // Handle the error here
          console.error('An error occurred while refreshing tasks:', error);
        });
    },
    fetchProjects(ownerId: string, offset: number, limit: number): Promise<void> {
      const contractorService = new ContractorService();
      return contractorService
        .getTasks(ownerId, offset, limit)
        .then((taskList: ContractorList) => {
          this.tasks = taskList.contractors;
          this.totalTasks = taskList.total;
          this.firstOffset = taskList.first;
          console.log('Fetched task list: ', this.tasks);
        })
        .catch((error) => {
          // Handle the error here
          console.error('An error occurred while fetching tasks:', error);
        });
    },
    setSelectedTask(selection: ContractorItem) {
      this.selectedTask = selection;
      console.log('Task selection changed: ', this.selectedTask);
    },
  },
});