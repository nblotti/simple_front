import {Component, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {ScreenReadyMessage} from "./SreenReadyMessage";
import {MetaData, NgEventBus} from 'ng-event-bus';
import {sprintf} from 'sprintf-js';
import {LineBreakPipe} from "./line-break.pipe";


@Component({
  selector: 'chat-component',
  standalone: true,
  imports: [FormsModule, HttpClientModule, LineBreakPipe],
  providers: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  inputMessage: string = "";
  private searchPerimeter = "1";

  private current_conversation: string = ""
  private screenReadyMessages: Array<ScreenReadyMessage> = new Array<ScreenReadyMessage>()

  private chat_command_url: string = "https://assistmeai.nblotti.org/chat/command/?command=%s&conversation_id=%s&perimeter=%s"
  private chat_messages_url: string = "https://assistmeai.nblotti.org/chat/messages/?conversation_id=%s"

  @ViewChild('scrollMe') private myScrollContainer: any;

  constructor(private eventBus: NgEventBus, private httpClient: HttpClient) {


    this.eventBus.on("command:conversationchange").subscribe((meta: MetaData) => {

      this.current_conversation = meta.data
      this.screenReadyMessages = [];
      this.screenReadyMessages.push(new ScreenReadyMessage("1", "assistant", "How can I help you ?"));
      this.loadConversationMessages()
    });
    this.eventBus.on("command:perimeterchanged").subscribe((meta: MetaData) => {
      this.searchPerimeter = meta.data;
    });
  }

  loadConversationMessages() {
    let call_url = sprintf(this.chat_messages_url, this.current_conversation);
    this.httpClient.get<Messages[]>(call_url).subscribe({
      next: (result) => {
        result.forEach((message) => {
          if (message.type = "AI") {
            this.screenReadyMessages.push(new ScreenReadyMessage("1", "assistant", message.content));
          } else if (message.type = "human") {
            this.screenReadyMessages.push(new ScreenReadyMessage("1", "user", message.content));
          }
        });
      }
    })
  }

  getMessages(): ScreenReadyMessage[] {
    this.scrollToBottom();
    return this.screenReadyMessages;

  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  /*
  * Drag management functions
  *
  * */

  onKeyUp($event: KeyboardEvent) {

    if ($event.key === 'Enter') {


      let call_url = sprintf(this.chat_command_url, this.inputMessage, this.current_conversation, this.searchPerimeter);
      this.screenReadyMessages.push(new ScreenReadyMessage("1", "user", this.inputMessage));
      this.inputMessage = "";

      this.httpClient.get<string>(call_url).subscribe({
        next: (result) => {
          this.screenReadyMessages.push(new ScreenReadyMessage("1", "assistant", result));
        },
        error: (result: string) => {
          console.log(result)
        }
      })
    }
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


