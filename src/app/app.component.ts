import {
  Component, ComponentRef, ElementRef, inject, Injector, OnInit, ViewChild, ViewContainerRef,
} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MetaData, NgEventBus} from "ng-event-bus"

import {ChatComponent} from "./chat/chat.component";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {FileUploadDialogComponent} from "./file-upload-dialog/file-upload-dialog.component";
import {ActivatedRoute, NavigationEnd, Route, Router, RouterLink, RouterOutlet} from "@angular/router";
import {filter} from "rxjs";


@Component({
  selector: 'root',
  standalone: true,//  1. instantiate standalone flag
  imports: [CommonModule, ChatComponent, FileUploadDialogComponent, RouterOutlet, RouterLink],
  providers: [NgEventBus, HttpClientModule],
  templateUrl: './app.component.html', // 2.Render the Dom,
  styleUrl: './app.component.css'

})
export class AppComponent implements OnInit {

  showModal: boolean = false;

  @ViewChild('sidebar') sidebarRef!: ElementRef;
  @ViewChild('mainContent') mainContentRef!: ElementRef;
  isCollapsed: boolean = false;

  constructor(private router: Router) {

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
      //mainContent.style.marginLeft = '25%'; // Adjust the margin based on the width of the collapsed sidebar
    }
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(value => console.log('Current Route:', value.type));
  }

  openFileUploadDialog(): void {
    this.showModal = true;
  }
}
