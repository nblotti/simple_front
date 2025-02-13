import {computed, Injectable, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {ConversationService} from "./dashboard-main-screen/conversation.service";
import {Router} from "@angular/router";
import {StateInterface} from "./StateInterface";
import {DashboardState} from "./dashboard-main-screen/DashboardState";
import {ScreenReadyMessage} from "./chat-main-screen/SreenReadyMessage";
import {AssistantState} from "./assistant/AssistantState";
import {ShareState} from "./share/ShareState";
import {DocumentState} from "./dashboard-document-screen/DocumentState";

@Injectable({
  providedIn: 'root'
})
export class StateManagerService implements OnInit {


  public stateManager: WritableSignal<StateInterface> = signal(this.assistantState);
  public chatEnabled: WritableSignal<boolean> = signal(true);
  screenReadyMessages: Signal<ScreenReadyMessage[]> = computed((): ScreenReadyMessage[] => {
    return this.stateManager().getScreenReadyMessages()();
  });

  constructor(private conversationService: ConversationService, private router: Router,
              private dashboardState: DashboardState,
              private assistantState: AssistantState,
              private shareState: ShareState,
              private documentState: DocumentState
  ) {
  }

  private _wheeWindow: WritableSignal<boolean> = signal(false);

  get wheeWindow(): WritableSignal<boolean> {
    return this._wheeWindow;
  }

  set wheeWindow(value: WritableSignal<boolean>) {
    this._wheeWindow = value;
  }

  private _blurWindow: WritableSignal<boolean> = signal(false);

  get blurWindow(): WritableSignal<boolean> {
    return this._blurWindow;
  }

  set blurWindow(value: WritableSignal<boolean>) {
    this._blurWindow = value;
  }



  ngOnInit(): void {

    this.stateManager().loadConversationMessages()

  }

  getScreenReadyMessages(): Signal<ScreenReadyMessage[]> {

    return this.screenReadyMessages;

  }


  public loadAssistant() {
    this.router.navigate(['/assistant']);
  }

  /*********************************************************************************************
   /*L'utilisateur a pressé sur enter et envoyé un nouveau message
   */
  public sendCommand(current_message: string) {
    this.wheeWindow.set(true);
    this.stateManager()
      .sendCommand(current_message)
      .then(() => {
        console.log("Command sent successfully!");
      })
      .catch((error) => {
        console.error("Error sending command:", error);
      })
      .finally(() => {
        this.wheeWindow.set(false);
      });

  }

  public clearConversation() {
    this.stateManager().clearConversation().subscribe(value => {
      this.resetMessages();
    })
  }

  public setCurrentConversation(conversation_id: number) {

    this.stateManager().setCurrentConversation(conversation_id);

    this.loadConversationMessages();
  }

  public setCurrentState(state: STATES) {
    switch (state) {
      case STATES.Assistant:
        this.stateManager.set(this.assistantState);
        this.stateManager().loadConversationMessages();
        this.chatEnabled.set(true);
        break;
      case STATES.Dashboard:
        this.stateManager.set(this.dashboardState);
        this.stateManager().loadConversationMessages();
        this.chatEnabled.set(true);
        break;
      case STATES.Share:
        this.stateManager.set(this.shareState);
        this.chatEnabled.set(false);
        break;
      case STATES.Document:
        this.stateManager.set(this.documentState);
        this.stateManager().loadConversationMessages();
        this.chatEnabled.set(true);
        break;
    }

  }

  public setPerimeter(perimeter: string) {
    this.stateManager().setPerimeter(perimeter)

  }

  startVoiceCommand(): Promise<boolean> {

    return this.stateManager().startVoiceCommand();
  }

  async endVoiceCommand(): Promise<boolean> {
    this.wheeWindow.set(true);
    try {
      return await this.stateManager().endVoiceCommand();
    } finally {
      this.wheeWindow.set(false); // Ensure window is unblurred regardless of success or failure
    }
  }


  private loadConversationMessages() {
    this.stateManager().loadConversationMessages();

  }

  private resetMessages() {
    this.stateManager().clearConversation();
  }
}

export enum STATES {
  Dashboard = "DASHBOARD",
  Assistant = "ASSISTANT",
  Share = "SHARE",
  Document = "DOCUMENT",
}
