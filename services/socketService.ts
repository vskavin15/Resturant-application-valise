import type { Socket } from 'socket.io-client';

// This tells TypeScript to assume an `io` function is available globally.
// The mock server script will provide it.
declare const io: (url: string, options: any) => Socket;

// The mock server will run in the same browser context for this simulation.
const MOCK_SERVER_URL = window.location.origin;

let socketInstance: Socket | null = null;

// getSocket function to lazily initialize the socket.
export const getSocket = (): Socket => {
    if (!socketInstance) {
        socketInstance = io(MOCK_SERVER_URL, {
            // In a real scenario, you might have auth tokens.
            // For this mock, we are keeping it simple.
            autoConnect: false, // We will connect manually in the DataProvider
        });
    }
    return socketInstance;
};
