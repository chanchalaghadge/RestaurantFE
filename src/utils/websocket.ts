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
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private isConnecting = false;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws?.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = tokenStorage.getToken();
      const apiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 
        'https://restaurantbe-api-apgwf4dac2gfaqaq.southindia-01.azurewebsites.net';

      // Convert HTTPS to WSS for WebSocket
      const wsUrl = apiUrl.replace(/^https?/, 'wss') + '/ws';
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        // Send authentication token
        if (token) {
          this.sendMessage({
            type: 'auth',
            token: token
          });
        }

        // Subscribe to default channels
        this.subscribeToOrders();
        this.subscribeToDashboard();

        // Start ping interval to keep connection alive
        this.startPingInterval();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.stopPingInterval();
        
        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
          
          setTimeout(() => {
            this.connect();
          }, delay);
        } else {
          console.error('Max reconnection attempts reached');
          this.isConnecting = false;
        }
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    }
  }

  private handleMessage(message: any): void {
    if (message.type) {
      this.emit(message.type, message.data);
    }
  }

  private sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      this.sendMessage({ type: 'ping' });
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
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
    this.sendMessage({
      type: 'subscribe_orders'
    });
  }

  async unsubscribeFromOrders(): Promise<void> {
    this.sendMessage({
      type: 'unsubscribe_orders'
    });
  }

  async subscribeToTables(): Promise<void> {
    // Currently not implemented in backend
    console.log('Subscribe to tables not yet implemented');
  }

  async unsubscribeFromTables(): Promise<void> {
    // Currently not implemented in backend
    console.log('Unsubscribe from tables not yet implemented');
  }

  async subscribeToDashboard(): Promise<void> {
    this.sendMessage({
      type: 'subscribe_dashboard'
    });
  }

  async unsubscribeFromDashboard(): Promise<void> {
    this.sendMessage({
      type: 'unsubscribe_dashboard'
    });
  }

  async disconnect(): Promise<void> {
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear all event handlers
    this.eventHandlers.clear();
  }

  getConnectionState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
