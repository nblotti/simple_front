import {AfterViewChecked, Component, computed, Input, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {StateManagerService} from "../state-manager.service";
import {HighlightDirective} from "../chat-highlight-content/highlight.component";
import {AppCopyButtonDirective} from "../chat-copy-content-button/copy-button.component";
import {NavigationStateService} from "../dashboard-document-screen/navigation-state.service";
import {Router} from "@angular/router";
import {Location, NgClass} from '@angular/common';
import {UserContextService} from "../auth/user-context.service";


@Component({
  selector: 'chat-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, HighlightDirective, AppCopyButtonDirective, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, AfterViewChecked {

  inputMessage: string = "";
  newMessage: boolean = false;
  @Input() text: string = '';
  protected listening: WritableSignal<boolean> = signal(false);
  protected isRecording: WritableSignal<boolean> = signal(false);
  protected screenReadyMessage = computed(() => {
    this.newMessage = true;
    return this.statemanagerService.getScreenReadyMessages()();
  });
  @ViewChild('scrollMe') private myScrollContainer: any;

  constructor(protected statemanagerService: StateManagerService,
              private navStateService: NavigationStateService,
              private router: Router,
              private location: Location,
              private userContextService: UserContextService) {


  }

  ngOnInit() {
    this.scrollToBottom();
    let groups = this.userContextService.getGroups()();
    if (groups.includes("agp_prod_speech_to_text")) {
      this.listening.set(true);
    }
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

  runAction(): void {

    let current_message = this.inputMessage
    this.inputMessage = "";

    this.statemanagerService.sendCommand(current_message);
  }

  clearInput() {
    this.statemanagerService.clearConversation();
  }


  startRecording() {
    if(this.isRecording())
      this.stopRecording();
    else
    this.statemanagerService.startVoiceCommand().then(value => {
      this.isRecording.set(value);
    });
  }

  stopRecording() {
    this.statemanagerService.endVoiceCommand().then(value => {
      this.isRecording.set(value);
    });
  }
}

