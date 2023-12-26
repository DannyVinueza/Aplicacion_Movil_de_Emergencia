import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-singup',
  templateUrl: './singup.page.html',
  styleUrls: ['./singup.page.scss'],
})
export class SingupPage implements OnInit {

  singUpForm!: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private authService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.singUpForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^.{1,20}$/)
      ]]
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
    this.singUpForm.reset();
  }


  async singUp() {
    const loading = await this.loadingCtrl.create()
    await loading.present();
    if (this.singUpForm?.valid) {
      try {
        const user = await this.authService.register(
          this.singUpForm.value.email,
          this.singUpForm.value.password
        );

        loading.dismiss();
        this.resetForm();
        this.presentToast('Usuario creado satisfactoriamente');
        this.router.navigate(['/login']);

      } catch (error: any) {
        loading.dismiss();
        if (error.code === 'auth/email-already-in-use') {
          this.presentToast('Este correo electrónico ya está en uso');
        } else if (error.code === 'auth/invalid-email') {
          this.presentToast('El correo electrónico no es válido');
        } else {
          this.presentToast('Ocurrió un error al crear la cuenta ' + error.message);
        }
      }
    } else {
      loading.dismiss();
      this.presentToast('Por favor, completa todos los campos requeridos');
    }
  }

}
