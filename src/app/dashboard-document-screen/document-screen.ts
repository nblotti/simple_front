import {Component, OnInit, signal, ViewChild, WritableSignal} from '@angular/core';
import {Router} from "@angular/router";
import {catchError, map, tap, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {MetaData, NgEventBus} from "ng-event-bus";
import {GlobalsService} from "../globals.service";
import {NavigationStateService} from "./navigation-state.service";
import {StateManagerService, STATES} from "../state-manager.service";
import {ConversationService} from "../dashboard-main-screen/conversation.service";
import {NgxExtendedPdfViewerModule} from "ngx-extended-pdf-viewer";


@Component({
  selector: 'document-screen',
  standalone: true,
  templateUrl: './document-screen.html',
  imports: [
    NgxExtendedPdfViewerModule
  ],
  styleUrl: './document-screen.css'
})
export class DocumentScreen implements OnInit {


  protected pdfSrc?: Uint8Array;
  protected page: number = 0;
  @ViewChild('pdfViewerOnDemand') protected pdfViewerOnDemand!: any

  private readonly base_url;
  private documentId: number = 1;
  private content: string = '';
  private documentName: string = '';


  constructor(private router: Router,
              private stateManagerService: StateManagerService,
              private navStateService: NavigationStateService,
              private conversationService: ConversationService,
              private http: HttpClient,
              private eventBus: NgEventBus,
              private globalsService: GlobalsService) {

    this.base_url = globalsService.serverAssistmeBase + "document/"
  }

  ngOnInit(): void {
    this.stateManagerService.setCurrentState(STATES.Document);

    this.eventBus.on("change_page").subscribe((meta: MetaData) => {
      this.page = meta.data.data;
    });

    this.navStateService.getState().subscribe((state) => {

      if (state['focus_only']) {
        this.stateManagerService.chatFullScreen.set(true);
        this.documentId = state['documentId'];
        this.documentName = state['documentName'];
        this.stateManagerService.documentName.set(this.documentName);
        this.loadDocument(this.documentId);
      } else if (state) {
        this.stateManagerService.chatFullScreen.set(false);
        this.documentId = state['documentId'];
        this.documentName = state['documentName'];
        this.page = state['page'] + 1;
        if (state['content']) {
          const contentLines = state['content'].split('\n');
          this.content = contentLines.length > 0 ? contentLines[0] : '';
        }
        this.stateManagerService.documentName.set(this.documentName);
        this.loadDocument(this.documentId);
        const url = `${this.base_url}${this.documentId}/`;
        this.downloadFile(url);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('documentId') && urlParams.has('page') && urlParams.has('content')) {
          this.documentId = Number(urlParams.get('documentId'));
          this.page = Number(urlParams.get('page')) + 1;
          this.content = urlParams.get('content') || '';
          this.loadDocument(this.documentId);
          const url = `${this.base_url}${this.documentId}/`;
          this.downloadFile(url);
        }
      }
    });
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
            this.loadConversationAndDocument(value.id)
          })
        } else {
          this.loadConversationAndDocument(result[0].id)
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
  public loadConversationAndDocument(conversationId: number) {

    this.stateManagerService.setCurrentConversation(conversationId);
    //this.conversationService.setCurrentConversation(conversationId);

  }


  private blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        resolve(new Uint8Array(arrayBuffer));
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(blob);
    });
  }

  private downloadFile(url: string): any {
    return this.http.get(url, {responseType: 'blob'})
      .subscribe((blob) => {
          this.pdfViewerOnDemand.src = blob;

        });

  }


}
