import axios from 'axios';

export interface ContractorItem {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
}

export interface ContractorList {
    first: number;
    size: number;
    total: number;
    contractors: ContractorItem[];
}

export default class ContractorService {
    private readonly baseUrl: string = '/api/v1/contractors';

    getTasks(ownerId: string, offset: number = 0, limit: number = 10): Promise<ContractorList> {
        const url = `${this.baseUrl}/${ownerId}/tasks`;
        return axios.get(url, { params: { limit: limit, offset: offset } }).then((response) => {
          const contractorList: ContractorList = response.data;
          console.log('GET tasks:', contractorList);
          return contractorList;
        });
      }

      getTask(ownerId: string, taskId:string): Promise<ContractorItem> {
        const url = `${this.baseUrl}/${ownerId}/task/${taskId}`;
        return axios
          .get(url)
          .then((response) => {
            const task: ContractorItem = response.data
            console.log('GET task by ID', task);
            return task;
          })
          .catch((error) => {
            console.log('task retrieval error', error.request.status);
    
            console.error(error.request.status);
            throw error.request.status; // This will allow error to be caught where getProject is called
          });
      }
}