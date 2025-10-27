import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(url?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(url || import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  // Generic event listener
  on<K extends keyof SocketEvents>(event: K, callback: (data: SocketEvents[K]) => void): void {
    if (!this.socket) {
      this.connect();
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    this.socket!.on(event as string, callback as any);
  }

  // Remove event listener
  off<K extends keyof SocketEvents>(event: K, callback?: (data: SocketEvents[K]) => void): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event as string, callback as any);
      const listeners = this.listeners.get(event) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.socket.off(event as string);
      this.listeners.delete(event);
    }
  }

  // Emit event
  emit<K extends keyof SocketEvents>(event: K, data: SocketEvents[K]): void {
    if (!this.socket) {
      console.warn('Socket not connected, cannot emit event:', event);
      return;
    }

    this.socket.emit(event as string, data);
  }

  // Authenticate as host
  authenticateHost(token: string): void {
    this.emit('host:authenticate' as any, { token });
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Wait for connection
  waitForConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (this.socket.connected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      this.socket.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
}

export const socketService = new SocketService();
