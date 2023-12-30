import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

//Ubicación
import { Geolocation } from '@ionic-native/geolocation/ngx';

//import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-ubicacion',
  templateUrl: './ubicacion.page.html',
  styleUrls: ['./ubicacion.page.scss'],
})
export class UbicacionPage implements OnInit {
  latitude: any = 0;
  longitude: any = 0;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private geolocation: Geolocation,
    private firestore: AngularFirestore
  ) { }
  
  options = {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: 3600
  };

  ngOnInit() {
    this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
      if (!user || !user.uid) {
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }
    });
  }

  getCurrentCoordinates() {
    this.geolocation.getCurrentPosition().then((resp: { coords: { latitude: any; longitude: any; }; }) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      // Get the current user's ID
      this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
        if (user && user.uid) {
          // Store the location with the user ID
          this.firestore.collection(`ubicaciones/${user.uid}/user_locations`).add({
            latitude: this.latitude,
            longitude: this.longitude,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            console.log('Ubicación guardada en Firebase');
            setTimeout(() => {
              this.router.navigate(['chat'])
            })
          })
          .catch((error) => {
            console.error('Error al guardar ubicación en Firebase:', error);
          });
        } else {
          console.error('Usuario no autenticado. No se puede obtener el ID');
          this.router.navigate(['loader']);
        }
      });
    }).catch((error) => {
      console.log('Error, no se puede obtener tu ubicacion', error);
    });
  }
}
