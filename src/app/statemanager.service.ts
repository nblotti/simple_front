import {Injectable, signal, WritableSignal} from '@angular/core';
import {ConversationService} from "./conversation.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class StatemanagerService {


  constructor(private conversationService: ConversationService,
              private router: Router) {
  }

  /*********************************************************************************************
   /*un changement de conversation a été demandé.Cela peut venir du menu ou du dashboard
   /* 1. on set la conversation courante dans le service
   /* 2. on (re)charge le Dashboard
   * /2. on envoie le messages  au chat et au dasbhoard de se mettre à jour
   */
  init() {

    //1 on set la conversation courante dans le service
    this.conversationService.setCurrentConversation("")

    //2. on (re)charge le Dashboard
    this.router.navigate(['/dashboard']);

    //3 on envoie les deux messages ->  au chat.
    //this.eventBus.cast("load_conversation")

  }

  /*
  loadConversationOnly(conversationId: string) {

    //1 on set la conversation courante dans le service
    this.conversationService.setCurrentConversation(conversationId)

    //2. on (re)charge le Dashboard
    this.router.navigate(['/dashboard']);

    //3 on envoie les deux messages ->  au chat.
    this.eventBus.cast("load_conversation")

  }
*/
  /*********************************************************************************************
   /*un nouveau document a été demandé sans la conversation. Cela peut venir du chat ou du dashboard
   /* 1. on charge le numéro de chat
   /* 1a. on a pas de numéro de chat existant pour ce document, on en crée un -> createConversationt
   * /2. on envoie les deux messages -> a au chat. b au pdf viewer
   */
  loadDocument(documentId: string) {
    // 1. on charge le numéro de chat ou on le crée
    this.conversationService.loadOrCreateConversationsByDocumentId(documentId).subscribe({
      next: (result) => {
        //on a pas trouvé de conversation, on la crée
        if (result.length == 0) {
          this.conversationService.createConversation(documentId).subscribe(value => {
              this.loadConversationAndDocument(value.id, documentId)
            }
          )
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
   /*un changement de conversation a été demandé avec le document.Cela vient du dashboard
   /* 1. on set la conversation courante dans le service
   /* 2. on charge le pdf viewer
   * /2. on envoie les deux messages ->  au chat. + au pdf viewer
   */
  loadConversationAndDocument(conversationId: string, documentId: string) {

    this.conversationService.setCurrentConversation(conversationId)

    this.router.navigate(['/docs', documentId, 0]);

  }

  createConversation(documentId
                       :
                       string
  ) {
    this.conversationService.createConversation(documentId).subscribe({
      next: (result) => {
        //on a la conversation + le document on envoie les événements
        this.loadConversationAndDocument(result.id, documentId)
      }, error: (error) => {
        console.error('Delete failed:', error);
      }, complete: () => {
      }
    });

  }


}
