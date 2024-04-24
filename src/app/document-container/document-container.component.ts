import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Event} from "@angular/router";
import {PdfJsViewerComponent, PdfJsViewerModule} from "ng2-pdfjs-viewer";
import {map} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {NgEventBus} from "ng-event-bus";


@Component({
  selector: 'app-document-container',
  standalone: true,
  imports: [
    PdfJsViewerModule,
  ],
  templateUrl: './document-container.component.html',
  styleUrl: './document-container.component.css'
})
export class DocumentContainerComponent implements AfterViewInit {

  private base_url = "https://assistmeai.nblotti.org/files/";

  @ViewChild('pdfViewerOnDemand') protected pdfViewerOnDemand!: any


  constructor(private route: ActivatedRoute, private http: HttpClient, private eventBus: NgEventBus) {
  }

  ngAfterViewInit(): void {
    this.route.params.subscribe(params => {

      let url = this.base_url + params['document_id'] + "/"

      this.openPdf(url)
    });
  }


  private downloadFile(url: string): any {
    return this.http.get(url, {responseType: 'blob'})
      .pipe(
        map((result: any) => {
          return result;
        })
      );
  }

  public openPdf(url: string) {

    this.downloadFile(url).subscribe(
      (res: any) => {
        this.pdfViewerOnDemand.pdfSrc = res; // pdfSrc can be Blob or Uint8Array
        this.pdfViewerOnDemand.refresh(); // Ask pdf viewer to load/reresh pdf
      }
    );
  }
}
