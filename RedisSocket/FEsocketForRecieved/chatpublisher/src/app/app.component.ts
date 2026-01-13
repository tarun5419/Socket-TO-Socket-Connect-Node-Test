import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './service/socket.service';
import { SocketConnectChatComponent } from './components/socket-connect-chat/socket-connect-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SocketConnectChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  messages: string[] = [];

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {

  }

}
