import { Component, OnInit } from '@angular/core';
import { VoiceRecorder, GenericResponse } from 'capacitor-voice-recorder';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-voice-recorder',
  templateUrl: './voice-recorder.component.html',
  styleUrls: ['./voice-recorder.component.scss'],
})
export class VoiceRecorderComponent implements OnInit {

  isRecording: boolean = false;
  audioData: string | null = null;
  user: any;

  constructor(
    private storage: AngularFireStorage,
    private router: Router,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    VoiceRecorder.hasAudioRecordingPermission().then(result => {
      if (!result.value) {
        VoiceRecorder.requestAudioRecordingPermission();
      }
    });
    this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
      if (!user || !user.uid) {
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }
    });
  }

  Grabar() {
    if (this.isRecording) {
      return;
    }
    this.isRecording = true;
    VoiceRecorder.startRecording()
      .then((result: GenericResponse) => console.log("Grabando..."))
      .catch(error => console.log(error));
  }

  Detener() {
    this.authService.getId().subscribe((user: { uid: string | null, email: string | null }) => {
      if (user && user.uid) {
        VoiceRecorder.stopRecording().then(result => {
            const audioData = result.value.recordDataBase64;
            const fileName = `audio_${new Date().getTime()}.wav`;
            const filePath = `audio/${user.uid}/${fileName}`;
    
            const audioRef = this.storage.ref(filePath);
            const uploadTask = audioRef.putString(audioData, 'base64', { contentType: 'audio/wav' });
    
            uploadTask.snapshotChanges().pipe(
              finalize(() => {
                audioRef.getDownloadURL().subscribe(downloadURL => {
                  console.log('Audio guardado', downloadURL);
                });
              })
            ).subscribe();
        });
        // setTimeout(() => {
        //   this.router.navigate(['...'])
        // })

      }else{
        console.error('Usuario no autenticado. No se puede obtener el ID');
        this.router.navigate(['loader'])
      }

    });
  }
  // Play() {
  //   if (this.audioData) {
  //     const audio = new Audio();
  //     audio.src = `data:audio/wav;base64,${this.audioData}`;
  //     audio.load();
  //     audio.play();
  //   }
  // }
}
