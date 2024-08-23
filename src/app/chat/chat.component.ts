import {AfterViewChecked, Component, computed, OnInit, Signal, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {NgEventBus} from 'ng-event-bus';
import {LineBreakPipe} from "./line-break.pipe";
import {StateManagerService} from "../state-manager.service";
import {ScreenReadyMessage} from "./SreenReadyMessage";


@Component({
  selector: 'chat-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LineBreakPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit,AfterViewChecked {

  inputMessage: string = "";
  @ViewChild('scrollMe') private myScrollContainer: any;

  protected screenReadyMessage= computed(() => {

      return this.statemanagerService.getScreenReadyMessages()();
  });

  constructor(private eventBus: NgEventBus,
              private httpClient: HttpClient,
              protected statemanagerService: StateManagerService) {


  }

  ngOnInit() {
    this.scrollToBottom();
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  /*********************************************************************************************
   /*L'utilisateur a envoyé une nouvelle commande, on traite
   */
  onKeyUp($event: KeyboardEvent) {

    if ($event.key === 'Enter' && $event.shiftKey) {
      this.runAction();
    }
    if ($event.key === 'Enter' && $event.ctrlKey) {
      this.runAction();
    }
  }

  /*********************************************************************************************
   /*Click sur une référence de document  dans le chat
   */
  displaySource($event: MouseEvent, documentId: string, page_number: number) {
    this.statemanagerService.loadDocument(Number(documentId))
    $event.preventDefault()
  }

  scrollToBottom(): void {
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
}

