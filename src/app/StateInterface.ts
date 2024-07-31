import {ScreenReadyMessage} from "./chat/SreenReadyMessage";
import {Signal, WritableSignal} from "@angular/core";
import {Observable} from "rxjs";

export interface StateInterface {


  sendCommand(current_message: string): void;

  clearConversation(): Observable<any>;

  getScreenReadyMessages(): Signal<ScreenReadyMessage[]>;

  loadConversationMessages(): void;


  setCurrentConversation(conversation_id: number): void;
}
