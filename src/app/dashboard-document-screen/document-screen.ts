import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {catchError, map, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NgEventBus} from "ng-event-bus";
import {GlobalsService} from "../globals.service";
import {NavigationStateService} from "./navigation-state.service";
import {PdfViewerComponent, PdfViewerModule} from "ng2-pdf-viewer";
import {StateManagerService, STATES} from "../state-manager.service";
import {ConversationService} from "../dashboard-main-screen/conversation.service";


@Component({
  selector: 'document-screen',
  standalone: true,
  templateUrl: './document-screen.html',
  imports: [
    PdfViewerModule
  ],
  styleUrl: './document-screen.css'
})
export class DocumentScreen implements OnInit {


  protected pdfSrc?: Uint8Array;
  protected page: number = 0;
  @ViewChild(PdfViewerComponent, {static: false})
  private pdfComponent?: PdfViewerComponent;
  private readonly base_url;
  private documentId: number = 1;
  private content: string = '';

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
    this.navStateService.getState().subscribe((state) => {
      if (state) {
        this.documentId = state['documentId'];
        this.page = state['page'] + 1;
        if (state['content']) {
          const contentLines = state['content'].split('\n');
          this.content = contentLines.length > 0 ? contentLines[0] : '';
        }
        this.loadDocument(this.documentId, this.page, this.content);
        const url = `${this.base_url}${this.documentId}/`;
        this.openPdf(url);


      } else {
        console.error('No state found');
      }
    });
  }

  public openPdf(url: string) {

    this.downloadFile(url).subscribe(
      (res: Blob) => {
        this.blobToUint8Array(res).then((uint8Array: Uint8Array) => {
          if (this.pdfComponent != null) {
            this.pdfSrc = uint8Array; // Assign the Uint8Array to the pdfComponent
          }
        }).catch(err => {
          console.error("Conversion failed", err);
        });
      },
      (error: any) => {
        console.error("Download failed", error);
      }
    );
  }

  search() {

    this.pdfComponent?.eventBus.dispatch('find', {
      query: this.content,
      caseSensitive: false,
      findPrevious: undefined,
      highlightAll: true,
      phraseSearch: true
    });
  }

  /*********************************************************************************************
   /*Chargement du document et du chat associé. Cela peut venir du chat ou du dashboard
   /* 1. on charge le numéro de chat
   /* 1a. on a pas de numéro de chat existant pour ce document, on en crée un -> createConversation
   * /2. on envoie les deux messages -> a au chat. b au pdf viewer
   */
  public loadDocument(documentId: number, page: number, content: string) {
    // 1. on charge le numéro de chat ou on le crée
    this.conversationService.loadOrCreateConversationsByDocumentId(documentId).subscribe({
      next: (result) => {
        //on a pas trouvé de conversation, on la crée
        if (result.length == 0) {
          this.conversationService.createConversation(documentId).subscribe(value => {
            this.loadConversationAndDocument(value.id, documentId, page, content)
          })
        } else {
          this.loadConversationAndDocument(result[0].id, documentId, page, content)
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
  public loadConversationAndDocument(conversationId: number, documentId: number, page: number, content: string) {

    this.stateManagerService.setCurrentConversation(conversationId);
    //this.conversationService.setCurrentConversation(conversationId);

  }

  protected callBackFn(pdf: CustomEvent) {

    this.search();
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
      .pipe(
        catchError(error => {
          // Handle the error
          console.error('Error occurred:', error);
          return throwError(error); // Rethrow the error or return a custom error
        })
        , map((result: any) => {
          return result;
        })
      );
  }


}
