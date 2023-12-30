import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { Observable, BehaviorSubject } from 'rxjs';

import { ApiService } from './api.service';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private _uid = new BehaviorSubject<string | null>(null);
  currentUser: any;

  constructor(
    private ngFireAuth: AngularFireAuth,
    private apiService: ApiService
  ) { }

  async login(email: string, password: string): Promise<any> {
    try {
      const response = await this.ngFireAuth.signInWithEmailAndPassword(email, password);
      console.log(response);
      if (response?.user) {
        this.setUserData(response.user.uid);
      }
    } catch (err) {
      throw (err)
    }
  }

  getId(): Observable<{ uid: string | null, email: string | null }> {
    return new Observable<{ uid: string | null, email: string | null }>((observer) => {
      const auth = getAuth();
      this.currentUser = auth.currentUser;
      const uid = this.currentUser?.uid || null;
      const email = this.currentUser?.email || null;
      // console.log('Usuario actual en AuthenticationService:', this.currentUser);
      observer.next({ uid, email });
      observer.complete();
    });
  }
  

  setUserData(uid: any) {
    this._uid.next(uid);
  }

  randomFromInterval(min: any, max: any) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  async register(email: string, password: string) {
    try {
      const register = await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
      console.log(register);
  
      const userData = {
        id: register.user?.uid,
      };
  
      return userData;
    } catch (error) {
      throw (error);
    }
  }

  async singOut() {
    try {
      await this.ngFireAuth.signOut();
      this._uid.next(null);
      return true;
    } catch (error) {
      throw (error);
    }
  }

  checkAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ngFireAuth.onAuthStateChanged(user => {
        //console.log("user auth: ", user);
        resolve(user);
      });
    });
  }

  async getUserData(id: any) {
    const docSnap: any = await this.apiService.getDocById(`users/${id}`);
    if (docSnap?.exists()) {
      return docSnap.data();
    } else {
      throw ("No such document exists");
    }
  }
}