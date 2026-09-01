export interface User {
    id: string;
    username: string;
    email: string;
    profile_picture: string | null;
    created_at: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;

    login: () => Promise<void>;
    logout: () => void;
}
