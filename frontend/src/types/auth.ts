export interface User {
    id: string;
    username: string;
    user_id: string;
    created_at: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;

    login: () => Promise<void>;
    logout: () => void;
}