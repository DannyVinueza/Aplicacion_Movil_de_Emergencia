import { Component, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @ViewChild(IonContent) content!: IonContent;

  messages!: Observable<any[]>;  // Uso del modificador de no nulo
  newMsg = '';

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private chatService: ChatService
  ) { }

  ngOnInit() {
    this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
      if (!user || !user.uid) {
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }else{
        this.messages = this.chatService.getChatMessages();
      }
    });
  }
  sendMessage() {
    this.chatService.addChatMessage({ msg: this.newMsg }).then(() => {
      this.newMsg = '';
      this.content.scrollToBottom();
    });
    setTimeout(() => {
      this.router.navigate(['voice-recorder'])
    },2000)
  }
}
