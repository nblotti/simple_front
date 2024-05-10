import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {UserContextService} from "../user-context.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  password: string="";
  username: string="";

  constructor(private router:Router, private userContext:UserContextService) {
  }

  doLogin() {
    this.userContext.setLoggedIn(true, this.username, this.password)
    return this.router.navigate(['/dashboard'])
  }
}
