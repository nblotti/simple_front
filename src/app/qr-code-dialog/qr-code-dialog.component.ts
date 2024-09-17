import {Component, EventEmitter, Input, OnInit, Output, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {sha1} from "js-sha1";
import {GlobalsService} from "../globals.service";


@Component({
  selector: 'app-qr-code-dialog',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './qr-code-dialog.component.html',
  styleUrl: './qr-code-dialog.component.css'
})
export class QrCodeDialogComponent  {

  username: string = '';
  password: string = '';
  qrCodeUrl: WritableSignal<string> = signal("")
  showError: boolean = false;
  image: boolean = false;
  @Input() showModal!: any;
  @Output() closeModal = new EventEmitter<{ username: string, password: string }>();
  private qrTokenUrl: string = '';

  constructor(private http: HttpClient, private globalsService: GlobalsService) {

    this.qrTokenUrl = globalsService.serverAssistmeBase + "user/generate-qrcode/"
  }

  onSubmit() {
    let payload = {
      "info": {
        "sub": this.username,
        "exp": "1726398000000",
        "userPassword": sha1(this.password),
      }
    }
    const headers = new HttpHeaders({
      'Accept': 'image/png'
    });

    return this.http.post(this.qrTokenUrl, payload, {
      headers: headers,
      responseType: 'blob'
    }).subscribe(
      (blob: Blob) => {
        // Convert the blob to a URL
        let url = window.URL.createObjectURL(blob);
        this.qrCodeUrl.set(url)
        this.image = true;
        this.showError = false;
      },
      (error) => {
        this.showError = true;
        console.error('Error downloading the image', error);
      }
    );
  }

  onCloseModal() {
    this.closeModal.emit({username: this.username, password: this.password});
    this.password = "";
    this.username = ""
    this.image = false;
    this.showError = false;
  }


}
