import {Component, inject, signal, WritableSignal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {OAuthService} from "angular-oauth2-oidc";
import {LoginService} from "../auth/login.service";
import {Router} from "@angular/router";
import {sha1} from "js-sha1";
import {QrCodeDialogComponent} from "../qr-code-dialog/qr-code-dialog.component";
import {FileUploadDialogComponent} from "../dashboard-document-upload/file-upload-dialog.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    QrCodeDialogComponent,
    FileUploadDialogComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showModal: boolean = false;
  protected password: string = "";
  protected username: string = "";
  protected secondFactor: string = "";
  protected showError: WritableSignal<boolean> = signal(false);
  private oauthService = inject(OAuthService)

  constructor(private loginService: LoginService, private router: Router) {

  }


  async doLogin() {
    let userProfile = {
      "info": {
        "sub": this.username,
        "userPassword": sha1(this.password),
        "secondFactor": this.secondFactor
      }
    }

    try {
      const loginSuccess: boolean = await this.loginService.doLocalLogin(userProfile);
      if (loginSuccess) {
        console.log('Login successful');
        this.showError.set(false);
        this.router.navigate(['/assistant']);
      } else {
        console.log('Login failed');
        // Additional logic for failed login
        this.showError.set(true);
      }
    } catch (error) {
      console.error('Error during login', error);
      // Handle the error
    }

  }


  registerSecondFactor() {
    this.showModal = true;
  }

  handleCloseModal(event: { username: string, password: string }) {
    this.password = event.password;
    this.username = event.username;
    this.showModal = false;  // Automatically hide the modal
  }
}

type CategoryType = [number, string];

