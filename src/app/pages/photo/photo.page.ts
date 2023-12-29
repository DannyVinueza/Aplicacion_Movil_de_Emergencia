import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/photo.service'
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.page.html',
  styleUrls: ['./photo.page.scss'],
  //providers: [AuthenticationService] 
})
export class PhotoPage implements OnInit {
  currentUser: any;

  constructor(
    public photoService: PhotoService,
    private router: Router,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.authService.getId().subscribe((uid: string | null) => {
      if (uid) {
        // console.log('Usuario actual en /photo:', uid);
        this.photoService.getPhotosByUserId(uid);
      } else {
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }
    });
  }
  
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
    // setTimeout(() => {
    //   this.router.navigate(['localizacion'])
    // }, 3000)
  }

}