import * as signalR from '@microsoft/signalr';
import { tokenStorage } from './security';

export type WebSocketEventType = 
  | 'order:created' 
  | 'order:updated' 
  | 'order:deleted' 
  | 'order:status_changed'
  | 'table:updated' 
  | 'table:status_changed'
  | 'dashboard:updated';

export type WebSocketEventHandler<T = any> = (data: T) => void;

class WebSocketService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.isConnecting || (this.connection?.state === signalR.HubConnectionState.Connected)) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = tokenStorage.getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 
        'https://restaurantbe-api-apgwf4dac2gfaqaq.southindia-01.azurewebsites.net';

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiUrl}/restauranthub`, {
          accessTokenFactory: () => token || '',
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 3s, 6s, 12s, 24s, 30s
            if (retryContext.previousRetryCount < 4) {
              return 3000 * Math.pow(2, retryContext.previousRetryCount);
            }
            return 30000; // Max 30 seconds
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start connection
      await this.connection.start();
      console.log('WebSocket connected successfully');
      
      this.reconnectAttempts = 0;
      this.isConnecting = false;

      // Subscribe to default groups
      await this.subscribeToOrders();
      await this.subscribeToDashboard();

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      
      // Attempt reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`);
        
        setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Order events
    this.connection.on('order:created', (data) => {
      this.emit('order:created', data);
    });

    this.connection.on('order:updated', (data) => {
      this.emit('order:updated', data);
    });

    this.connection.on('order:deleted', (data) => {
      this.emit('order:deleted', data);
    });

    this.connection.on('order:status_changed', (data) => {
      this.emit('order:status_changed', data);
    });

    // Table events
    this.connection.on('table:updated', (data) => {
      this.emit('table:updated', data);
    });

    this.connection.on('table:status_changed', (data) => {
      this.emit('table:status_changed', data);
    });

    // Dashboard events
    this.connection.on('dashboard:updated', (data) => {
      this.emit('dashboard:updated', data);
    });
  }

  on<T = any>(eventType: WebSocketEventType, handler: WebSocketEventHandler<T>): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  private emit<T = any>(eventType: WebSocketEventType, data: T): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  }

  async subscribeToOrders(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SubscribeToOrders');
        console.log('Subscribed to orders');
      } catch (error) {
        console.error('Failed to subscribe to orders:', error);
      }
    }
  }

  async unsubscribeFromOrders(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('UnsubscribeFromOrders');
        console.log('Unsubscribed from orders');
      } catch (error) {
        console.error('Failed to unsubscribe from orders:', error);
      }
    }
  }

  async subscribeToTables(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SubscribeToTables');
        console.log('Subscribed to tables');
      } catch (error) {
        console.error('Failed to subscribe to tables:', error);
      }
    }
  }

  async unsubscribeFromTables(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('UnsubscribeFromTables');
        console.log('Unsubscribed from tables');
      } catch (error) {
        console.error('Failed to unsubscribe from tables:', error);
      }
    }
  }

  async subscribeToDashboard(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('SubscribeToDashboard');
        console.log('Subscribed to dashboard');
      } catch (error) {
        console.error('Failed to subscribe to dashboard:', error);
      }
    }
  }

  async unsubscribeFromDashboard(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('UnsubscribeFromDashboard');
        console.log('Unsubscribed from dashboard');
      } catch (error) {
        console.error('Failed to unsubscribe from dashboard:', error);
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('WebSocket disconnected');
      } catch (error) {
        console.error('Error disconnecting WebSocket:', error);
      }
      this.connection = null;
    }
    
    // Clear all event handlers
    this.eventHandlers.clear();
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();