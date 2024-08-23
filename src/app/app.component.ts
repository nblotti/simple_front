import {Component, computed, ElementRef, OnInit, signal, ViewChild, WritableSignal,} from '@angular/core';
import {CommonModule, DatePipe} from "@angular/common";
import {NgEventBus} from "ng-event-bus"

import {ChatComponent} from "./chat/chat.component";
import {HttpClientModule} from "@angular/common/http";
import {FileUploadDialogComponent} from "./file-upload-dialog/file-upload-dialog.component";
import {NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {filter} from "rxjs";
import {ConversationService} from "./dashboard/conversation.service";
import {StateManagerService} from "./state-manager.service";
import {UserContextService} from "./auth/user-context.service";
import {LoginComponent} from "./login/login.component";
import {DashboardState} from "./dashboard/DashboardState";
import {AssistantState} from "./assistant/AssistantState";
import {AssistantService} from "./assistant/assistant.service";
import {ShareState} from "./share/ShareState";

@Component({
  selector: 'root',
  standalone: true,//  1. instantiate standalone flag
  imports: [CommonModule, ChatComponent, FileUploadDialogComponent, RouterOutlet, RouterLink, RouterLinkActive],
  providers: [NgEventBus, HttpClientModule,  DatePipe, DashboardState, AssistantState, ShareState,StateManagerService,
    ConversationService,AssistantService, LoginComponent],
  templateUrl: './app.component.html', // 2.Render the Dom,
  styleUrl: './app.component.css'

})
export class AppComponent implements OnInit {

  showModal: boolean = false;


  @ViewChild('sidebar') sidebarRef!: ElementRef;
  @ViewChild('mainContent') mainContentRef!: ElementRef;
  isCollapsed: boolean = false;
  isLoggedIn = computed<boolean>(() => {
    return  this.usercontextService.isLogged() && this.stateManagerService.chatEnabled()
  });

  constructor(private router: Router, protected usercontextService: UserContextService, private stateManagerService: StateManagerService,) {
  }

  toggleCollapse(): void {
    const sidebar = this.sidebarRef.nativeElement;
    const mainContent = this.mainContentRef.nativeElement;
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {

      sidebar.classList.remove('shared_side');
      mainContent.classList.remove('shared');

      sidebar.classList.add('collapsed_side');
      mainContent.classList.add('full');
      mainContent.style.marginLeft = '0';
    } else {
      sidebar.classList.remove('collapsed_side');
      mainContent.classList.remove('full');

      sidebar.classList.add('shared_side');
      mainContent.classList.add('shared');
    }
  }

  ngOnInit(): void {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(value => console.log('Current Route:', value.type));
  }

  openFileUploadDialog(): void {
    this.showModal = true;
  }

  logout() {

  }

  loadAssistant() {
    this.stateManagerService.loadAssistant();
  }
}
