import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm!: FormGroup;

  constructor(
    private formBuider: FormBuilder,
    private toastCtrl: ToastController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.loginForm = this.formBuider.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', Validators.required]
    })
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2500,
      position: 'middle',
    });

    await toast.present();
  }

  resetForm() {
    this.loginForm.reset();
  }

  async login() {
    const loading = await this.loadingCtrl.create();
    await loading.present();
    if (this.loginForm.valid) {
      const user = await this.authService.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      )
        .then(res => {
          loading.dismiss();
          this.resetForm();
          this.router.navigate(['/home']);

        })
        .catch(err => {
          loading.dismiss();
          this.presentToast("Credentials are invalid");
        })

    }

  }

}
