import {computed, Injectable, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {ConversationService} from "./dashboard/conversation.service";
import {Router} from "@angular/router";
import {StateInterface} from "./StateInterface";
import {DashboardState} from "./dashboard/DashboardState";
import {ScreenReadyMessage} from "./chat/SreenReadyMessage";
import {AssistantState} from "./assistant/AssistantState";

@Injectable({
  providedIn: 'root'
})
export class StateManagerService implements OnInit {
  public stateManager: WritableSignal<StateInterface> = signal(this.assistantdState);

  screenReadyMessages: Signal<ScreenReadyMessage[]> = computed((): ScreenReadyMessage[] => {
    console.log(this.stateManager().getScreenReadyMessages()());
    return this.stateManager().getScreenReadyMessages()();
  });

  constructor(private conversationService: ConversationService, private router: Router,
              private dashboardState: DashboardState,
              private assistantdState: AssistantState
  ) {
  }

  ngOnInit(): void {

    this.stateManager().loadConversationMessages()

  }

  getScreenReadyMessages(): Signal<ScreenReadyMessage[]> {

    return this.screenReadyMessages;

  }

  /*********************************************************************************************
   /*Chargement du document et du chat associé. Cela peut venir du chat ou du dashboard
   /* 1. on charge le numéro de chat
   /* 1a. on a pas de numéro de chat existant pour ce document, on en crée un -> createConversation
   * /2. on envoie les deux messages -> a au chat. b au pdf viewer
   */
  public loadDocument(documentId: number) {
    // 1. on charge le numéro de chat ou on le crée
    this.conversationService.loadOrCreateConversationsByDocumentId(documentId).subscribe({
      next: (result) => {
        //on a pas trouvé de conversation, on la crée
        if (result.length == 0) {
          this.conversationService.createConversation(documentId).subscribe(value => {
            this.loadConversationAndDocument(value.id, documentId)
          })
        } else {
          this.loadConversationAndDocument(result[0].id, documentId)
        }
      }, error: (error) => {
        console.error('Delete failed:', error);
      }, complete: () => {
      }
    });
  }

  /*********************************************************************************************
   /*L'utilisateur a clické dans le Dashboard sur une conversation qui porte sur un document.
   /* 1. on set la conversation courante dans le service
   /* 2. on charge le pdf viewer
   * /2. on envoie les deux messages ->  au chat. + au pdf viewer
   */
  public loadConversationAndDocument(conversationId: number, documentId: number) {

    this.conversationService.setCurrentConversation(conversationId)
    this.loadConversationMessages();
    this.router.navigate(['/docs', documentId, 0]);

  }

  public loadAssistant() {
    this.router.navigate(['/assistant']);
  }

  /*********************************************************************************************
   /*L'utilisateur a pressé sur enter et envoyé un nouveau message
   */
  public sendCommand(current_message: string) {
    this.stateManager().sendCommand(current_message);
  }

  public clearConversation() {
    this.conversationService.clearConversation().subscribe(value => {
      this.resetMessages();
    })
  }

  public setCurrentConversation(conversation_id: number) {
    this.conversationService.setCurrentConversation(conversation_id);
    this.loadConversationMessages();
  }

  public setCurrentState(state: STATES) {
    switch (state) {
      case STATES.Assistant:
        this.stateManager.set(this.assistantdState);
        this.stateManager().loadConversationMessages();
        break;
      case STATES.Dashboard:
        this.stateManager.set(this.dashboardState);
        this.stateManager().loadConversationMessages();
        break;
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
  Assistant = "ASSISTANT"
}
