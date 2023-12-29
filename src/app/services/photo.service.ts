import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: UserPhoto[] = [];

  constructor(
    private authService: AuthenticationService,
    private storage: AngularFireStorage
  ) { }

  public async addNewToGallery() {

    // Tomar una foto
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const user = this.authService.currentUser;
    if (user) {
      const photoPath = `users/${user.uid}/${new Date().getTime()}.jpg`;
      await this.uploadPhoto(capturedPhoto.webPath!, photoPath);
      this.photos.unshift({
        filepath: photoPath,
        webviewPath: capturedPhoto.webPath!
      });
    } else {
      console.error('Usuario no autenticado. No se puede subir la imagen.');
      return;
    }
  }

  public getPhotosByUserId(userId: string): void {
    // Limpiar la lista actual de fotos
    this.photos = [];

    const user = this.authService.currentUser;
    if (user) {
      // Obtener la referencia al directorio de imágenes del usuario
      const userStoragePath = `users/${user.uid}/`;

      // Obtener la lista de elementos en el directorio
      this.storage.ref(userStoragePath).listAll().subscribe((result) => {
        result.items.forEach(async (item) => {
          // Obtener la URL de descarga de la imagen
          const downloadUrl = await item.getDownloadURL();

          // Agregar la imagen a la lista
          this.photos.push({
            filepath: item.fullPath,
            webviewPath: downloadUrl
          });
        });
      });
    } else {
      console.error('Usuario no autenticado. No se puede subir la imagen.');
      return;
    }
  }

  private async uploadPhoto(webPath: string, storagePath: string): Promise<void> {
    try {
      const response = await fetch(webPath);
      const blob = await response.blob();
      await this.storage.upload(storagePath, blob);
      console.log('Imagen subida exitosamente:', storagePath);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  }
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
