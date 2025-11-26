import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export function useSocket(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection with fallback configuration
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'], // Try polling first to avoid WebSocket errors
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);

      // Join user's room if userId provided
      if (userId) {
        socket.emit('join', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      // Suppress websocket errors - Socket.io will auto-fallback to polling
      if (!error.message?.includes('websocket')) {
        console.error('Socket connection error:', error);
      }
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      // Suppress websocket errors - Socket.io will auto-fallback to polling
      if (error && typeof error === 'object' && 'message' in error) {
        if (!error.message?.includes('websocket')) {
          console.error('Socket error:', error);
        }
      }
    });

    // Suppress WebSocket transport errors - Socket.io automatically falls back to polling
    socket.io.on('error', (error) => {
      // Silently handle WebSocket transport errors
      const errorStr = error?.toString() || '';
      if (errorStr.includes('websocket') || errorStr.includes('transport')) {
        // WebSocket failed, will fallback to polling automatically - this is normal
        return;
      }
      console.error('Socket.io engine error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Send message
  const sendMessage = (data: {
    senderId: string;
    receiverId: string;
    content: string;
    conversationId?: string;
  }) => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', data);
    }
  };

  // Typing indicators
  const emitTyping = (userId: string, receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { userId, receiverId });
    }
  };

  const emitStopTyping = (userId: string, receiverId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('stop_typing', { userId, receiverId });
    }
  };

  // Mark as read
  const markAsRead = (conversationId: string, userId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_read', { conversationId, userId });
    }
  };

  // Listen for events
  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markAsRead,
    on,
    off,
  };
}
