import {Injectable} from '@angular/core';
import {VoiceRecognitionService} from "./voice-recognition.service";
import {EMPTY, Observable, Subject} from "rxjs";
import RecordRTC from "recordrtc";
import {Result} from "../Result";


export interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderComponentService {


  private stream: any;
  private recorder: any;
  private _recorded = new Subject<RecordedAudioOutput>();
  private _recordingFailed = new Subject<string>();
  private conversationId: number = -1
  private perimeter: string = ""

  constructor(private speechService: VoiceRecognitionService) {
  }

  set voice_command_url(value: string) {
    this.speechService.voice_command_url = value;
  }


  // to get recorded audio
  getRecordedBlob(): Observable<RecordedAudioOutput> {
    return this._recorded.asObservable();
  }

  // if recording fail
  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  // to start audio recording
  startRecording(conversationId: number, perimeter: string = ""): Promise<boolean> {
    if (this.recorder) {
      // It means recording is already started or it is already recording something
      return Promise.resolve(false);
    }
    this.conversationId = conversationId;
    this.perimeter = perimeter;

    return navigator.mediaDevices.getUserMedia({audio: true})
      .then(stream => {
        this.stream = stream;
        this.record();
        return true;
      })
      .catch(error => {
        console.error(error);
        this._recordingFailed.next('');
        return false;
      });
  }


  // to abort (clear) recording
  abortRecording() {
    this.stopMedia();
  }

  // to stop audio recording
  stopRecording(): Observable<Result> {
    // Check if the recorder exists
    if (this.recorder) {
      // Create a subject to emit the result
      const resultSubject = new Subject<Result>();

      // Stop the recorder and process the blob
      this.recorder.stop((blob: any) => {
        const fileName = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');

        // Stop media and reset state
        this.stopMedia();
        this._recorded.next({blob, title: fileName});

        // Send the audio to the backend
        this.speechService.sendRecordedAudio(blob, fileName, this.conversationId, this.perimeter).subscribe({
          next: (result: Result) => {
            resultSubject.next(result); // Emit the result to the subject
            resultSubject.complete(); // Mark the subject as complete
          },
          error: (err) => {
            resultSubject.error(err); // Emit the error to the subject
          }
        });
      }, () => {
        // Handle recording failure
        this.stopMedia();
        this._recordingFailed.next('');
        resultSubject.error(new Error('Recording failed'));
      });

      // Return the observable tied to the result subject
      return resultSubject.asObservable();
    }

    // If recorder is not defined, return an EMPTY observable
    return EMPTY;
  }

  // for recording
  private record() {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/webm',
      numberOfAudioChannels: 1,
    });

    this.recorder.record();
  }

  // to reset media after recording stop
  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach((track: any) => track.stop());
        this.stream = null;
      }
    }
  }

}
