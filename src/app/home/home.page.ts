import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.authService.getId().subscribe((uid: string | null) => {
      if (uid) {
        console.log('Usuario actual en /photo:', uid);
      } else {
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }
    });
  }

  onEmergencyButtonClick() {
    this.router.navigate(['photo']);
  }
}
