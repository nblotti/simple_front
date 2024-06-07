import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {PdfJsViewerModule} from "ng2-pdfjs-viewer";
import {catchError, map, throwError} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NgEventBus} from "ng-event-bus";
import {GlobalsService} from "../globals.service";


@Component({
  selector: 'document-screen',
  standalone: true,
  imports: [
    PdfJsViewerModule,
  ],
  templateUrl: './document-screen.html',
  styleUrl: './document-screen.css'
})
export class DocumentScreen implements AfterViewInit {

  @ViewChild('pdfViewerOnDemand') protected pdfViewerOnDemand!: any
  private base_url;

  constructor(private route: ActivatedRoute, private http: HttpClient, private eventBus: NgEventBus, private globalsService : GlobalsService) {

    this.base_url = globalsService.serverBase+"document/"
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {

      let url = this.base_url + params['document_id'] + "/"
      this.openPdf(url)

    });
  }

  public openPdf(url: string) {

    this.downloadFile(url).subscribe(
      (res: any) => {
        this.pdfViewerOnDemand.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
        this.pdfViewerOnDemand.refresh(); // Ask pdf viewer to load/reresh pdf
      }
    );
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
