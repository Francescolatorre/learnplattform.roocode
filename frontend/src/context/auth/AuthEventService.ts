import {IAuthEvent} from './types';

type Listener = (event: IAuthEvent) => void;

class AuthEventService {
    private listeners: Listener[] = [];

    public subscribe(listener: Listener): () => void {
        this.listeners.push(listener);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    public publish(event: IAuthEvent): void {
        this.listeners.forEach(listener => listener(event));
    }
}

// Singleton-Instanz erstellen
export const authEventService = new AuthEventService();
