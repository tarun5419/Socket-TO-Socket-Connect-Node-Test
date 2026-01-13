import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../../service/socket.service';

@Component({
  selector: 'app-socket-connect-chat',
  standalone: true,
  imports: [],
  templateUrl: './socket-connect-chat.component.html',
  styleUrl: './socket-connect-chat.component.scss'
})
export class SocketConnectChatComponent implements OnInit, OnDestroy {
  messages: string[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    // this.socketService.on('message', (data: any) => {
    //   // this.messages.push(data);
    // });
  }

  connect(): void {
    this.socketService.connect(); // Replace with your WebSocket server URL
  }

  sendMessage(): void {
    this.socketService.emit('send_message', 'Hello from Angular!');
  }

  disconnect(): void {
    this.socketService.disconnect();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

}
