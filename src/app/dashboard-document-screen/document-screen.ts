import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {catchError, map, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NgEventBus} from "ng-event-bus";
import {GlobalsService} from "../globals.service";
import {NavigationStateService} from "./navigation-state.service";
import {PDFDocumentProxy, PdfViewerComponent, PdfViewerModule} from "ng2-pdf-viewer";


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
  @ViewChild(PdfViewerComponent, {static: false})
  private pdfComponent?: PdfViewerComponent;

  private readonly base_url;
  private documentId: number = 1;
  protected page: number = 0;
  private content: string = '';

  constructor(private router: Router, private navStateService: NavigationStateService, private http: HttpClient, private eventBus: NgEventBus, private globalsService: GlobalsService) {

    this.base_url = globalsService.serverAssistmeBase + "document/"
  }

  ngOnInit(): void {
    this.navStateService.getState().subscribe((state) => {
      if (state) {
        this.documentId = state['documentId'];
        this.page = state['page']+1;
        if (state['content']) {
          const contentLines = state['content'].split('\n');
          this.content = contentLines.length > 0 ? contentLines[0] : '';
        }
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

  search() {
    console.log(this.content)
    this.pdfComponent?.eventBus.dispatch('find', {
      query: this.content,
      caseSensitive: false,
      findPrevious: undefined,
      highlightAll: true,
      phraseSearch: true
    });
  }
}
