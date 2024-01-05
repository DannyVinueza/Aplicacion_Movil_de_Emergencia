import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Camera, CameraResultType } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class EmergencyService {

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  
  async recordVideo(): Promise<string> {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const mediaRecorder = new MediaRecorder(mediaStream);
    const chunks: any[] = [];
  
    mediaRecorder.start();
  
    return new Promise<string>((resolve, reject) => {
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
  
      mediaRecorder.onstop = async (event) => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        console.log('Blob:', blob);
  
        const storageRef = this.storage.ref(`videos/${Date.now()}.mp4`);
        console.log('StorageRef:', storageRef);
  
        try {
          const snapshot = await storageRef.put(blob);
          console.log('Upload successful:', snapshot);
  
          const videoUrl = await storageRef.getDownloadURL().toPromise();
          console.log('Video URL:', videoUrl);
  
          resolve(videoUrl);
        } catch (error) {
          console.error('Error uploading video:', error);
          reject(new Error('Error al subir el video a Firebase'));
        }
      };
  
      mediaRecorder.onerror = (event) => {
        console.error('Error al grabar video:', event);
        reject(new Error('Error al grabar video'));
      };
  
      // Definir la duración de la grabación de video (en este caso, 5 segundos)
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000);
    });
  }
  
  getStorageRef(path: string) {
    return this.storage.ref(path);
  }


}