import axios from "axios";

// Define the ChatSession interface
export interface ChatSession {
    id: string; // Unique identifier for the session
    name: string; // Name of the chat session
    participants: string[]; // List of participant IDs or names
    createdAt: string; // Timestamp of session creation
    updatedAt?: string; // Timestamp of the last update
}

// Define a class to handle chat session operations
export class ChatSessionService {
    private apiUrl: string;

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl; // Base URL for the backend API
    }

    // Create a new chat session
    async createChatSession(name: string, participants: string[]): Promise<ChatSession> {
        try {
            const response = await axios.post<ChatSession>(`${this.apiUrl}/chatSessions`, {
                name,
                participants,
            });
            return response.data;
        } catch (error) {
            console.error("Error creating chat session:", error);
            throw error;
        }
    }

    // Load (get) chat sessions
    async loadChatSessions(): Promise<ChatSession[]> {
        try {
            const response = await axios.get<ChatSession[]>(`${this.apiUrl}/chatSessions`);
            return response.data;
        } catch (error) {
            console.error("Error loading chat sessions:", error);
            throw error;
        }
    }

    // Delete a chat session
    async deleteChatSession(sessionId: string): Promise<void> {
        try {
            await axios.delete(`${this.apiUrl}/chatSessions/${sessionId}`);
        } catch (error) {
            console.error("Error deleting chat session:", error);
            throw error;
        }
    }
}

// Example usage
const chatService = new ChatSessionService("https://your-backend-api-url.com");

// Creating a new chat session
chatService
    .createChatSession("Team Discussion", ["user1", "user2"])
    .then((session) => console.log("Created session:", session))
    .catch((error) => console.error("Create error:", error));

// Loading all chat sessions
chatService
    .loadChatSessions()
    .then((sessions) => console.log("Loaded sessions:", sessions))
    .catch((error) => console.error("Load error:", error));

// Deleting a chat session
chatService
    .deleteChatSession("session-id-123")
    .then(() => console.log("Session deleted"))
    .catch((error) => console.error("Delete error:", error));

