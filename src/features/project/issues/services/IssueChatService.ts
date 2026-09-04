import { apiClient, type ApiComponents, type Readable, type Writable } from '@/services/ApiClient';

export type ChatMessageJson = Readable<ApiComponents['schemas']['ChatMessageJson']>;
export type ChatMessageWritableJson = Writable<ApiComponents['schemas']['ChatMessageJson']>;

const chatPath = '/ticketing/v1/issues/{issueId}/chat';

class IssueChatService {
  async getMessages(issueId: string): Promise<ChatMessageJson[]> {
    const options = { pathParams: { issueId } };
    const result = await apiClient.get(chatPath, options);
    return result.messages ?? [];
  }

  async sendMessage(issueId: string, message: string): Promise<ChatMessageJson> {
    const payload: ChatMessageWritableJson = { message };
    const options = { pathParams: { issueId } };
    return apiClient.post(chatPath, payload, options) as Promise<ChatMessageJson>;
  }
}

export const issueChatService = new IssueChatService();
