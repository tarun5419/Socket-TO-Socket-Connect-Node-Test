import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import * as newSocketIo from 'socket.io-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angularclient';

  private socket: any;

  constructor() {
    this.socket = newSocketIo.io('http://localhost:3000', { transports: ['websocket'] });;
    // this.reciever()

    this.socket.on('connect', () => {
      console.log('Connected to App 1');
      this.socket.emit('message', 'Hello from App 2');
      this.reciever();
  });
  
  // socket.on('response', (data) => {
  //     console.log('Response from App 1:', data);
  // });
  }


        reciever(){
          this.socket.on('recieverFromSocket', (data: any) => {
            console.log(data);
            
          });
        }

  emitEvent(event: string, data: any): void {
    this.socket.emit(event, data);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
