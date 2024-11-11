import {AfterViewChecked, Component, computed, Input, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {NgEventBus} from 'ng-event-bus';
import {LineBreakPipe} from "./line-break.pipe";
import {StateManagerService} from "../state-manager.service";
import {HighlightJsDirective} from "ngx-highlight-js";
import {HighlightDirective} from "../chat-highlight-content/highlight.component";
import {AppCopyButtonDirective} from "../chat-copy-content-button/copy-button.component";
import {NavigationStateService} from "../dashboard-document-screen/navigation-state.service";
import {Router} from "@angular/router";
import {Location} from '@angular/common';


@Component({
  selector: 'chat-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LineBreakPipe, HighlightJsDirective, HighlightDirective, AppCopyButtonDirective],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {

  inputMessage: string = "";
  newMessage: boolean = false;
  @Input() text: string = '';
  protected screenReadyMessage = computed(() => {
    this.newMessage = true;
    return this.statemanagerService.getScreenReadyMessages()();
  });
  @ViewChild('scrollMe') private myScrollContainer: any;

  constructor(private eventBus: NgEventBus,
              private httpClient: HttpClient,
              protected statemanagerService: StateManagerService,
              private navStateService: NavigationStateService,
              private router: Router,
              private location: Location) {


  }

  ngOnInit() {
    this.scrollToBottom();

  }


  ngAfterViewChecked() {
    if (this.newMessage) {
      this.scrollToBottom();
      this.newMessage = false;
    }

  }


  /*********************************************************************************************
   /*L'utilisateur a envoyé une nouvelle commande, on traite
   */
  onKeyUp($event
            :
            KeyboardEvent
  ) {

    if ($event.key === 'Enter' && (!$event.shiftKey && !$event.ctrlKey)) {
      this.runAction();
    }
  }

  /*********************************************************************************************
   /*Click sur une référence de document  dans le chat
   */
  displaySource($event: MouseEvent, documentId: string, page: number, content: string) {


    const queryParams = {documentId: documentId, page: page, content: content};

    // Using Angular's Router to serialize the URL with query params
    const url = this.location.prepareExternalUrl(this.router.serializeUrl(
      this.router.createUrlTree(['/docs'], {queryParams})
    ));

    // Opening a new tab
    window.open(url, '_blank');

    $event.preventDefault()
  }

  displayHrefSource($event: MouseEvent, url: string, text: string) {


    window.open(url, '_blank');

    $event.preventDefault();
  }


  scrollToBottom()
    :
    void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }


  clearConversation() {


  }

  runAction()
    :
    void {

    let current_message = this.inputMessage
    this.inputMessage = "";

    this.statemanagerService.sendCommand(current_message);
  }

  clearInput() {
    this.statemanagerService.clearConversation();
  }


}

