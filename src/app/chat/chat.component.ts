import {Component, computed, OnInit, Signal, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {NgEventBus} from 'ng-event-bus';
import {LineBreakPipe} from "./line-break.pipe";
import {StateManagerService} from "../state-manager.service";


@Component({
  selector: 'chat-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LineBreakPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {

  inputMessage: string = "";
  @ViewChild('scrollMe') private myScrollContainer: any;

  constructor(private eventBus: NgEventBus,
              private httpClient: HttpClient,
              protected statemanagerService: StateManagerService) {


  }

  ngOnInit() {
    this.scrollToBottom();


  }


  /*********************************************************************************************
   /*L'utilisateur a envoyé une nouvelle commande, on traite
   */
  onKeyUp($event: KeyboardEvent) {

    if ($event.key === 'Enter') {

      let current_message = this.inputMessage
      this.inputMessage = "";

      this.statemanagerService.sendCommand(current_message);

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
    this.statemanagerService.clearConversation();

  }

}

