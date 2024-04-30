import {Component, signal, ViewChild, WritableSignal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {ScreenReadyMessage} from "./SreenReadyMessage";
import {NgEventBus} from 'ng-event-bus';
import {sprintf} from 'sprintf-js';
import {LineBreakPipe} from "./line-break.pipe";
import {v4 as uuidv4} from 'uuid';
import {ConversationService} from "../conversation.service";
import {StatemanagerService} from "../statemanager.service";
import {Subject, takeUntil, timer} from "rxjs";


@Component({
  selector: 'chat-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LineBreakPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  inputMessage: string = "";

  //private screenReadyMessages: Array<ScreenReadyMessage> = new Array<ScreenReadyMessage>()
  readonly screenReadyMessages: WritableSignal<ScreenReadyMessage[]> = signal([])

  private chat_messages_url: string = "https://assistmeai.nblotti.org/chat/messages/?conversation_id=%s"
  @ViewChild('scrollMe') private myScrollContainer: any;

  constructor(private eventBus: NgEventBus,
              private httpClient: HttpClient,
              private conversationService: ConversationService,
              private statemanagerService: StatemanagerService) {


    this.screenReadyMessages.set([new ScreenReadyMessage(uuidv4(), "assistant", "How can I help you ?")]);

    this.eventBus.on("load_conversation").subscribe(value => {
      this.screenReadyMessages.set([new ScreenReadyMessage(uuidv4(), "assistant", "How can I help you ?")]);

      this.loadConversationMessages();

    })


  }

  /*********************************************************************************************
   /*On a detecté qu'une nouvelle conversation a été selectionnée, on charge les message dans le chat
   */
  loadConversationMessages() {
    let call_url = sprintf(this.chat_messages_url, this.conversationService.getCurrentConversation());
    console.log("loadConversationMessages : " + call_url)
    this.httpClient.get<Messages[]>(call_url).subscribe({
      next: (result) => {
        result.forEach((message) => {
          if (message.type == "ai") {
            this.screenReadyMessages().push(new ScreenReadyMessage(uuidv4(), "assistant", message.content));
          } else if (message.type == "human") {
            this.screenReadyMessages().push(new ScreenReadyMessage(uuidv4(), "user", message.content));
          }
        });
        this.scrollToBottom();
      }
    })
  }

  /*********************************************************************************************
   /*L'utilisateur a envoyé une nouvelle commande, on traite
   */
  onKeyUp($event: KeyboardEvent) {

    if ($event.key === 'Enter') {

      let current_message = this.inputMessage
      this.inputMessage = "";

      this.screenReadyMessages().push(new ScreenReadyMessage(uuidv4(), "user", current_message));

      this.conversationService.sendCommand(current_message).subscribe({
        next: (result) => {
          let sources: Source[] = this.buildSources(result.sources)
          this.screenReadyMessages().push(new ScreenReadyMessage(uuidv4(), "assistant", result.result, sources));
        },
        error: (result: string) => {
          console.log(result)
        },
        complete:()=>{
          this.scrollToBottom();

        }
      })
    }
  }

  /*********************************************************************************************
   /*Click sur une référence de document  dans le chat
   */
  displaySource($event: MouseEvent, documentId: string, page_number: number) {
    this.statemanagerService.loadDocument(documentId)
    $event.preventDefault()
  }


  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  buildSources(sources: Source[]): Source[] {
    let source_http_url: Source[] = []

    sources.forEach(item => {

      let loc_source = new Source(item.blob_id, item.file_name, item.page, item.perimeter)
      source_http_url.push(loc_source)
    });

    return source_http_url;
  }


}

export class Source {
  blob_id: string
  file_name: string
  page: number
  perimeter: string


  public constructor(blob_id: string, file_name: string, page: number, perimeter: string) {
    this.blob_id = blob_id;
    this.file_name = file_name;
    this.page = page;
    this.perimeter = perimeter;

  }
}


class Messages {
  content: string
  additional_kwargs: any
  response_metadata: any
  type: string
  name: string
  id: string
  example: boolean

  public constructor(content: string, additional_kwargs: any = {}, response_metadata: any = {},
                     type: string, name: string = "", id: string = "", example: boolean = false) {
    this.content = content
    this.additional_kwargs = additional_kwargs
    this.response_metadata = response_metadata
    this.type = type
    this.name = name
    this.id = id
    this.example = example
  }
}


