import {StateInterface} from "../StateInterface";
import {Component, Signal, signal, WritableSignal} from "@angular/core";
import {ScreenReadyMessage} from "../chat-main-screen/SreenReadyMessage";
import {ConversationService} from "../dashboard-main-screen/conversation.service";
import {Observable, of} from "rxjs";


@Component({
  standalone: true,
  template: ''
})
export class ShareState implements StateInterface {

  public screenReadyMessages: WritableSignal<ScreenReadyMessage[]> = signal([]);

  private conversationService: ConversationService;

  constructor(conversationService: ConversationService) {
    this.conversationService = conversationService;
  }

  clearConversation(): Observable<any> {
    return of({success: true, message: 'Conversation cleared'});

  }

  getScreenReadyMessages(): Signal<ScreenReadyMessage[]> {
    return this.screenReadyMessages;

  }

  loadConversationMessages(): void {
  }

  sendCommand(current_message: string): Promise<void>
  {
    return Promise.resolve()
  }

  setCurrentConversation(conversation_id: number): void {
  }

  setPerimeter(perimeter: string): void {
  }

  endVoiceCommand(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Add logic to stop voice commands
      resolve(true); // Or reject with an error
    });

  }

  startVoiceCommand(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Add logic to stop voice commands
      resolve(false); // Or reject with an error
    });

  }


}

