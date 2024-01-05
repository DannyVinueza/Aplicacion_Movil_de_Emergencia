import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { EmergencyService } from 'src/app/services/emergency.service';
import firebase from 'firebase/compat/app';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.page.html',
  styleUrls: ['./video-recorder.page.scss'],
})
export class VideoRecorderPage implements OnInit {
  videoRecorded = false;
  recording = false;
  countdownValue = 0;
  recordingCountdownValue = 5;
  successMessage: string | null = null;
  videoStream!: MediaStream;
  videoUrl!: string;
  user: any;
  latestVideo: any;
  latestAudio: any;
  latestImage: any;
  latestMessage: any;
  latestLocation: any;

  constructor(
    private toastController: ToastController,
    private router: Router,
    private authService: AuthenticationService,
    private firestore: AngularFirestore,
    private estorage: AngularFireStorage,
    private changeDetector: ChangeDetectorRef,
    private emergencyService: EmergencyService
  ) { }

  ngOnInit() {
    this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
      if (!user || !user.uid) {
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }
    });
  }

  async recordVideo() {
    try {
      this.countdownValue = 3;
      await this.startRecordingAfterCountdown(); // Comienza a grabar el video
      this.videoRecorded = true;
      this.recording = false;
      console.log('Video grabado con éxito');
      this.changeDetector.detectChanges();
    } catch (error) {
      console.log('Error al grabar el video:', error)
      console.error('Error al grabar el video:', error);
      // Maneja el error aquí
    }
  }

  async startRecording() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      this.videoStream = mediaStream;
      this.startRecordingAfterCountdown();
    } catch (error) {
      console.log('Error al grabar el video:', error)
    }
  }

  async startRecordingAfterCountdown() {
    this.authService.getId().subscribe(async (user: { uid: string | null, email: string | null }) => {
      this.recording = true;
      const mediaRecorder = new MediaRecorder(this.videoStream);
      const chunks: any[] = [];
      let recordingSeconds = 5;

      mediaRecorder.start();

      const storageRefPath = `videos/${user.uid}/${Date.now()}.mp4`;
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async (event) => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const storageRef = this.emergencyService.getStorageRef(storageRefPath);

        try {
          const videoRef = storageRef.put(blob);
          await videoRef;
          storageRef.getDownloadURL().subscribe(
            (videoUrl: string) => {
              console.log('URL del video en Storage:', videoUrl);
              this.videoUrl = videoUrl;
              this.videoRecorded = true;
              this.recording = false;
              console.log('Video grabado con exito')
              this.changeDetector.detectChanges();

              // Detener la cámara después de la grabación del video
              const tracks = this.videoStream.getTracks();
              tracks.forEach((track) => track.stop());
              
            },
            (error: any) => {
              console.error('Error al obtener la URL del video:', error);
            }
          );
          const toast = await this.toastController.create({
            message: 'Emergencia enviada exitosamente',
            duration: 3000, // Duración de la notificación en milisegundos
            position: 'bottom', // Posición de la notificación (opcional)
          });
          toast.present();
          this.router.navigate(['/home']);
        } catch (error) {
          console.error('Error al subir el video:', error);
        }
        await this.saveEmergencyData()
      };
      const countdownInterval = setInterval(() => {
        recordingSeconds--;
        this.recordingCountdownValue = recordingSeconds;

        if (recordingSeconds === 0) {
          clearInterval(countdownInterval);
          mediaRecorder.stop();
        }
      }, 1000);
      this.changeDetector.detectChanges();
      
    })
  }

  async saveEmergencyData() {
    this.authService.getId().subscribe(async (user: { uid: string | null, email: string | null }) => {
      if (user && user.uid && user.email) {
        try {
          this.latestVideo = await this.getLatestMedia(user.uid, 'videos');
          this.latestAudio = await this.getLatestMedia(user.uid, 'audio');
          this.latestImage = await this.getLatestMedia(user.uid, 'img');
          this.latestMessage = await this.getLatestMessage(user.email);
          this.latestLocation = await this.getLatestLocation(user.uid);
          console.log('Datos antes de enviar la emergencia:', {
            pictureUrl: this.latestImage,
            videoUrl: this.latestVideo,
            audioUrl: this.latestAudio,
            locationLink: this.latestLocation,
            mensaje: this.latestMessage,
            userName: user.email,
          });
          // Ahora tienes los últimos elementos, puedes guardarlos en la nueva colección 'emergencia'
          await this.firestore.collection('emergencias').add({
            uid: user.uid,
            latestVideo:this.latestVideo,
            latestAudio:this.latestAudio,
            latestImage:this.latestImage,
            latestMessage:this.latestMessage,
            latestLocation:this.latestLocation,
            userName: user.email,
            timestamp: new Date().toLocaleString(),
          });
    
          console.log('Datos de emergencia guardados correctamente.');
        } catch (error) {
          console.error('Error al guardar datos de emergencia:', error);
        }
      }else{
        console.error('Usuario no autenticado. No se puede obtener el ID');
        return;
      }
    });
  }

  async getLatestMedia(userId: string, mediaType: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      let fileExtension:any;
  
      switch (mediaType) {
        case 'videos':
          fileExtension = '.mp4';
          break;
        case 'audio':
          fileExtension = '.wav';
          break;
        case 'img':
          fileExtension = '.jpg';
          break;
        default:
          console.error(`Tipo de medio no soportado: ${mediaType}`);
          resolve(null);
      }
  
      const storageRef = this.estorage.ref(`${mediaType}/${userId}`);
    
      try {
        let allMediaRefs = storageRef.listAll();
        allMediaRefs.subscribe(result => {
          let mediaFiles = result.items.filter((item: any) => item.name.endsWith(fileExtension));
          
          if (mediaFiles.length === 0) {
            console.log(`No se encontraron archivos ${mediaType} para el usuario ${userId}`);
            resolve(null);
          }
          
          let latestMediaFile = mediaFiles[mediaFiles.length - 1];
          latestMediaFile.getDownloadURL().then(url => {
            console.log(`La URL del último archivo ${mediaType} es ${url}`);
            resolve(url);
          }).catch(error => {
            console.error(`Error al obtener la URL de descarga del último archivo ${mediaType}:`, error);
            reject(error);
          });
        }, error => {
          console.error(`Error al listar todos los archivos ${mediaType}:`, error);
          reject(error);
        });
      } catch (error) {
        console.error(`Error al obtener los archivos ${mediaType}:`, error);
        reject(error);
      }
    });
  }

  async getLatestMessage(userEmail: string) {
    try {
      const querySnapshot = await this.firestore.collection('messages', ref => ref.where('from', '==', userEmail)
        .orderBy('createdAt', 'desc').limit(1)).get().toPromise();
  
      if (querySnapshot && !querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      } else {
        console.error('La consulta no retornó ningún resultado.');
        return null;
      }
    } catch (error) {
      console.log(error)
      console.error('Error al obtener el último mensaje:', error);
      return null;
    }
  }


  async getLatestLocation(userId: string) {
    try {
      const collectionRef = this.firestore.collection(`ubicaciones/${userId}/user_locations`).ref;
      const querySnapshot = await collectionRef.orderBy('timestamp', 'desc').limit(1).get();
  
      return querySnapshot.empty ? null : querySnapshot.docs[0].data();
    } catch (error) {
      console.error('Error al obtener la última ubicación:', error);
      return null;
    }
  }
}
