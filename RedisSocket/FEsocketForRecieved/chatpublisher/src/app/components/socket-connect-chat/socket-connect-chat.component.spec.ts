import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocketConnectChatComponent } from './socket-connect-chat.component';

describe('SocketConnectChatComponent', () => {
  let component: SocketConnectChatComponent;
  let fixture: ComponentFixture<SocketConnectChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocketConnectChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocketConnectChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
