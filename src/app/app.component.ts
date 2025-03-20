import {Component, computed, ElementRef, ViewChild} from '@angular/core';
import {CommonModule, DatePipe} from "@angular/common";
import {NgEventBus} from "ng-event-bus"

import {ChatComponent} from "./chat-main-screen/chat.component";
import {FileUploadDialogComponent} from "./dashboard-document-upload/file-upload-dialog.component";
import { Router, RouterLink, RouterOutlet} from "@angular/router";
import {ConversationService} from "./dashboard-main-screen/conversation.service";
import {StateManagerService} from "./state-manager.service";
import {UserContextService} from "./auth/user-context.service";
import {LoginComponent} from "./login/login.component";
import {DashboardState} from "./dashboard-main-screen/DashboardState";
import {AssistantState} from "./assistant/AssistantState";
import {AssistantService} from "./assistant/assistant.service";
import {DocumentService} from "./document.service";
import {DocumentState} from "./dashboard-document-screen/DocumentState";
import {LoginService} from "./auth/login.service";
import {AudioRecorderComponentService} from "./voice/audio-recorder-component.service";
import {SummaryPopupComponent} from "./summary-popup/summary-popup.component";

@Component({
  selector: 'root',
  standalone: true,//  1. instantiate standalone flag
  imports: [CommonModule, ChatComponent, FileUploadDialogComponent, RouterOutlet, RouterLink, SummaryPopupComponent],
  providers: [NgEventBus, DatePipe, DashboardState, AssistantState, DocumentState, StateManagerService,
    ConversationService, AssistantService, LoginComponent, LoginService, DocumentService, AudioRecorderComponentService],
  templateUrl: './app.component.html', // 2.Render the Dom,
  styleUrl: './app.component.css'

})
export class AppComponent  {

  showModal: boolean = false;



  blurWindow = computed<boolean>(() => {
    return this.stateManagerService.wheeWindow()
  });

  @ViewChild('sidebar') sidebarRef!: ElementRef;
  @ViewChild('mainContent') mainContentRef!: ElementRef;
  isCollapsed: boolean = false;
  isLoggedIn = computed<boolean>(() => {
    return this.userContextService.isLogged() && this.stateManagerService.chatEnabled()
  });


  constructor(private router: Router, protected userContextService: UserContextService, protected stateManagerService: StateManagerService,) {

  }




  openFileUploadDialog(): void {
    this.showModal = true;
    this.stateManagerService.blurWindow.set(true);
  }


  loadAssistant() {
    this.stateManagerService.loadAssistant();
  }

  closeModal() {
    this.showModal = false
    this.stateManagerService.blurWindow.set(false);
  }


  loadAdmin() {

  }

  isAdmin() {
    return this.userContextService.userAdminCategories().length != 0;
  }


}
