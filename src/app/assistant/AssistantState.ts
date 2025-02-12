import {StateInterface} from "../StateInterface";
import {Component, signal, WritableSignal} from "@angular/core";
import {ScreenReadyMessage} from "../chat-main-screen/SreenReadyMessage";

import {AssistantService} from "./assistant.service";
import {ConversationService} from "../dashboard-main-screen/conversation.service";
import {Observable} from "rxjs";
import {Source} from "../Source";
import {AudioRecorderComponentService} from "../voice/audio-recorder-component.service";

@Component({
  standalone: true,
  template: ''
})
export class AssistantState implements StateInterface {

  public screenReadyMessages: WritableSignal<ScreenReadyMessage[]> = signal([]);
  private conversation_id: number = 0;


  constructor(private assistantService: AssistantService, private conversationService: ConversationService,
              private audioRecorderComponentService: AudioRecorderComponentService) {
    this.assistantService = assistantService;
    this.audioRecorderComponentService = audioRecorderComponentService;
  }


  public getScreenReadyMessages(): WritableSignal<ScreenReadyMessage[]> {
    return this.screenReadyMessages;
  }

  public clearConversation(): Observable<any> {
    this.screenReadyMessages.set([new ScreenReadyMessage(1, "assistant", "How can I help you ?")]);
    return this.conversationService.clearConversation(this.conversation_id);

  }

  /*********************************************************************************************
   /*L'utilisateur a pressé sur enter et envoyé un nouveau message
   */

  sendCommand(current_message: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {

      this.screenReadyMessages.update(values => {
      return [...values, new ScreenReadyMessage(values.length, "user", current_message)];
    });

    this.assistantService.sendCommand(current_message, this.conversation_id).subscribe({
      next: (result) => {
        let sources: Source[] = this.buildSources(result.sources)
        this.screenReadyMessages.update(values => {
          return [...values, new ScreenReadyMessage(values.length, "assistant", result.result, sources)];
        });
      },
      error: (result: string) => {
        console.log(result)
        reject(result); // Reject on error

      },
      complete: () => {
        resolve(); // Resolve on completion
      }
    });
    });
  }



  public loadConversationMessages() {

    const screenMessages: ScreenReadyMessage[] = []

    this.assistantService.loadConversationMessages(this.conversation_id).subscribe({
      next: (result) => {
        result.forEach((message, index) => {
          if (message.type == "ai") {
            screenMessages.push(new ScreenReadyMessage(message.id, "assistant", message.content));
          } else if (message.type == "human") {
            screenMessages.push(new ScreenReadyMessage(message.id, "user", message.content));
          }
        });
        this.screenReadyMessages.set(screenMessages);
      }

    })


  }

  setCurrentConversation(conversation_id: number): void {
    this.conversation_id = conversation_id;
  }

  setPerimeter(perimeter: string): any {
    this.assistantService.setDocumentPerimeter(perimeter)
  }

  startVoiceCommand(): Promise<boolean> {
    this.audioRecorderComponentService.voice_command_url = "assistants/voicecommand/";
    return this.audioRecorderComponentService.startRecording(this.conversation_id);
  }

  endVoiceCommand(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.audioRecorderComponentService.stopRecording().subscribe({
        next: (result) => {
          if (result.question != null) {
            this.screenReadyMessages.update(values => {
              return [...values, new ScreenReadyMessage(values.length, "user", result.question)];
            });
          }
          let sources: Source[] = this.buildSources(result.sources)
          this.screenReadyMessages.update(values => {
            return [...values, new ScreenReadyMessage(values.length, "assistant", result.result, sources)];
          });
          resolve(false);
        },
        error: (result: string) => {
          console.log(result)
          resolve(false);
        },
        complete: () => {

        }
      })
    });

  }

  private buildSources(sources: Source[]): Source[] {
    let source_http_url: Source[] = []

    if (sources != null)
      sources.forEach(item => {

        let loc_source = new Source(item.blob_id, item.file_name, item.page, item.perimeter, item.text, item.type)
        source_http_url.push(loc_source)
      });

    return source_http_url;
  }

}

