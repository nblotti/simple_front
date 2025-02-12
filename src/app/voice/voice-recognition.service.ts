import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GlobalsService} from "../globals.service";
import {Result} from "../Result";


@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {

  constructor(private http: HttpClient, private globalsService: GlobalsService) {
  }

  private _voice_command_url: string = "assistants/voicecommand/";

  set voice_command_url(value: string) {
    this._voice_command_url = this.globalsService.serverAssistmeBase + value
  }

  sendRecordedAudio(blob: Blob, fileName: string, conversationId: number, perimeter: string = "") {
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('conversation_id', conversationId.toString());
    if (perimeter.length > 0)
      formData.append('perimeter', perimeter)

    return this.http.post<Result>(this._voice_command_url, formData)

  }
}

