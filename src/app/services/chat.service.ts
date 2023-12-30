import { FieldValue, serverTimestamp } from '@firebase/firestore';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { switchMap, map } from 'rxjs/operators';

import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthenticationService } from './authentication.service';
import { Observable } from 'rxjs';

export interface User {
  uid: string;
  email?: string;
}

export interface Message {
  createdAt: FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  currentUser: User = this.authService.currentUser;
  
  constructor(
    private authService: AuthenticationService,
    private storage: AngularFireStorage,
    private afs: AngularFirestore
  ) { }
  
  addChatMessage({ msg }: { msg: string }) {
    return this.afs.collection('messages').add({
      msg,
      from: this.currentUser.email,
      createdAt: serverTimestamp(),
    });
  }
  getChatMessages() {
    let users: User[] = [];
    return this.getUsers().pipe(
      switchMap(res => {
        users = res as User[];
        return this.afs.collection('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' }) as Observable<Message[]>;
      }),
      map(messages => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.email === m.from;
        }
        return messages;
      })
      
    );
  }

  private getUsers() {
    return this.afs.collection('users').valueChanges({ idField: 'email' }) as Observable<User[]>;
  }

  private getUserForMsg(msgFromEmail: string, users: User[]): string {
    const user = users.find(usr => usr.email === msgFromEmail);
    return user?.email || 'Deleted'; // Asumiendo que los usuarios tienen un campo 'email'
  }
  
}
