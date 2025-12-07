import { apiClient } from '@/services/ApiClient';

export type IssueType = 'APPLICATION' | 'TASK' | 'DEFECT' | 'MAINTENANCE';
export type IssueStatus = 'PENDING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'REJECTED';

export interface InboxMessage {
  id: string;
  receivedAt: Date;
  isRead: boolean;

  // Issue data
  issueId: string;
  issueTitle: string;
  issueType: IssueType;
  issueStatus: IssueStatus;

  // Project data
  projectId: string;
  projectName: string;
}

class InboxService {
  generateMockInboxData(): InboxMessage[] {
    return [
      {
        id: '1',
        receivedAt: new Date('2025-06-01T10:15:00'),
        isRead: false,
        issueId: 'issue-101',
        issueTitle: 'Heizung defekt',
        issueType: 'DEFECT',
        issueStatus: 'OPEN',
        projectId: 'proj-1',
        projectName: 'Neubau Musterstraße',
      },
      {
        id: '2',
        receivedAt: new Date('2025-05-28T14:30:00'),
        isRead: false,
        issueId: 'issue-102',
        issueTitle: 'Wartung Aufzug',
        issueType: 'MAINTENANCE',
        issueStatus: 'IN_PROGRESS',
        projectId: 'proj-1',
        projectName: 'Neubau Musterstraße',
      },
      {
        id: '3',
        receivedAt: new Date('2025-05-25T08:00:00'),
        isRead: true,
        issueId: 'issue-201',
        issueTitle: 'Fenster undicht',
        issueType: 'DEFECT',
        issueStatus: 'PENDING',
        projectId: 'proj-2',
        projectName: 'Campus Treskowallee',
      },
      {
        id: '4',
        receivedAt: new Date('2025-05-20T09:45:00'),
        isRead: false,
        issueId: 'issue-202',
        issueTitle: 'Antrag Mieterwechsel',
        issueType: 'APPLICATION',
        issueStatus: 'OPEN',
        projectId: 'proj-2',
        projectName: 'Campus Treskowallee',
      },
      {
        id: '5',
        receivedAt: new Date('2025-05-18T11:20:00'),
        isRead: false,
        issueId: 'issue-103',
        issueTitle: 'Reinigung Treppenhaus',
        issueType: 'TASK',
        issueStatus: 'CLOSED',
        projectId: 'proj-1',
        projectName: 'Neubau Musterstraße',
      },
      {
        id: '6',
        receivedAt: new Date('2025-05-15T22:31:00'),
        isRead: true,
        issueId: 'issue-203',
        issueTitle: 'Rauchmelder Alarm',
        issueType: 'DEFECT',
        issueStatus: 'CLOSED',
        projectId: 'proj-2',
        projectName: 'Campus Treskowallee',
      },
      {
        id: '7',
        receivedAt: new Date('2025-05-12T16:00:00'),
        isRead: false,
        issueId: 'issue-104',
        issueTitle: 'Schlüsselübergabe',
        issueType: 'TASK',
        issueStatus: 'REJECTED',
        projectId: 'proj-1',
        projectName: 'Neubau Musterstraße',
      },
    ];
  }

  async fetchInboxData(): Promise<InboxMessage[]> {
    return await apiClient.get('/notification/inbox' as any) as InboxMessage[];
    //return this.generateMockInboxData();
  }

  async markAsRead(messageId: string): Promise<void> {
    await apiClient.patch('/notification/inbox/{messageId}/read' as any, {}, {pathParams: { messageId }});
  }

  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete('/notification/inbox/{messageId}' as any, {pathParams: { messageId }});
  }
}

export const inboxService: InboxService = new InboxService();
