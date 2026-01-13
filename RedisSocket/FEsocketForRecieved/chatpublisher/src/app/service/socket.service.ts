import { Injectable } from '@angular/core';
import {Socket,io} from 'socket.io-client'

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  // socket = io("http://localhost:3000");
  private socket !: Socket;

  constructor() { 

  }

  connect(){
    this.socket = io("http://localhost:3000",{
      transports: ['websocket'], // Ensure WebSocket is used
      autoConnect: true, 
    }
    )
    this.socket.on('connect',()=>{
      console.log('connected from WebSocket server');
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection Error:', error);
    });
  }



   // Emit an event
  
  
   connect1(): void {
    this.socket = io("http://localhost:3000", {
      transports: ['websocket'], // Ensure WebSocket is used
      autoConnect: true,         // Automatically connect
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('Connected to the server with ID:', this.socket.id);
    });

    this.socket.on('connect_error', (err: any) => {
      console.error('Connection error:', err);
    });
  }
  
  
   emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Listen to an event
  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Disconnect the socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

}
