import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { getAuth } from 'firebase/auth';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public _uid = new BehaviorSubject<any>(null);
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

  getId() {
    const auth = getAuth();
    this.currentUser = auth.currentUser;
    console.log(this.currentUser);
    return this.currentUser?.uid;
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
      const data = {
        email: email,
        password: password,
        uid: register.user?.uid,
        photo: 'https://i.pravatar.cc/' + this.randomFromInterval(200, 400)
      }
      await this.apiService.setDocument(`users/${register.user?.uid}`, data);
      const userData = {
        id: register.user?.uid,
      }
      return userData;
    } catch (error) {
      throw (error)
    }
  }

  async singOut() {
    try {
      await this.ngFireAuth.signOut();
      this._uid.next(null);
      return true
    } catch (error) {
      throw (error)
    }
  }

  checkAuth(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ngFireAuth.onAuthStateChanged(user => {
        console.log("user auth: ", user);
        resolve(user);
      })
    })
  }

  async getUserData(id: any) {
    const docSnap: any = await this.apiService.getDocById(`users/${id}`);
    if (docSnap?.exits()) {
      return docSnap.data();
    } else {
      throw ("No such document exists")
    }
  }
}

