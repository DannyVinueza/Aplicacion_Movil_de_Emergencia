import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { EmergencyService } from 'src/app/services/emergency.service';

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

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private firestore: AngularFirestore,
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
    this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
      this.recording = true;
      console.log("Aqui01")
      console.log(this.videoStream)
      const mediaRecorder = new MediaRecorder(this.videoStream);
      console.log("Aqui1")
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
        } catch (error) {
          console.error('Error al subir el video:', error);
        }
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
}
