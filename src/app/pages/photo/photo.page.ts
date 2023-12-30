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
    this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
      if (user && user.uid) {
        // console.log('Usuario actual en /photo:', user.uid);
        this.photoService.getPhotosByUserId(user.uid);
      } else {
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }
    });
  }
  
  
  addPhotoToGallery() {
    this.photoService.addNewToGallery();
    setTimeout(() => {
      this.router.navigate(['ubicacion'])
    }, 3000)
  }

}