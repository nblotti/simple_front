import {StateInterface} from "../StateInterface";
import {Component, signal, WritableSignal} from "@angular/core";
import {ScreenReadyMessage} from "../chat/SreenReadyMessage";

import {AssistantService} from "./assistant.service";

@Component({
  standalone: true,
  template: ''
})
export class AssistantState implements StateInterface {

  public screenReadyMessages: WritableSignal<ScreenReadyMessage[]> = signal([]);

  private currentAssistant: number = 0;


  constructor(private assistantService: AssistantService) {
    this.assistantService = assistantService;
  }


  public getScreenReadyMessages(): WritableSignal<ScreenReadyMessage[]> {
    return this.screenReadyMessages;
  }

  public clearConversation(): void {
    this.screenReadyMessages.set([new ScreenReadyMessage(1, "assistant", "How can I help you ?")]);

  }

  /*********************************************************************************************
   /*L'utilisateur a pressé sur enter et envoyé un nouveau message
   */

  sendCommand(current_message: string): void {

    console.log(current_message);
    /*
        this.screenReadyMessages.update(values => {
          return [...values, new ScreenReadyMessage(uuidv4(), "user", current_message)];
        });

        this.assistantService.sendCommand(current_message, this.currentAssistant).subscribe({
          next: (result) => {

            this.screenReadyMessages.update(values => {
              return [...values, new ScreenReadyMessage(uuidv4(), "assistant", result)];
            });
          },
          error: (result: string) => {
            console.log(result)
          },
          complete: () => {

          }
        })

     */
  }

  public loadConversationMessages() {

    const screenMessages: ScreenReadyMessage[] = []
    screenMessages.push(new ScreenReadyMessage(1, "assistant", "How can I help you ?"));
    this.screenReadyMessages.set(screenMessages);

  }

}

