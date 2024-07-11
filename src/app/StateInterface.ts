import {ScreenReadyMessage} from "./chat/SreenReadyMessage";
import {Signal, WritableSignal} from "@angular/core";

export interface StateInterface {


  sendCommand(current_message: string): void;

  clearConversation(): void;

  getScreenReadyMessages(): Signal<ScreenReadyMessage[]>;

  loadConversationMessages(): void;


}
