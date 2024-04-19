import {AfterViewInit, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgEventBus} from "ng-event-bus";
import {HttpClient, HttpClientModule, HttpEvent, HttpHeaders} from "@angular/common/http";
import {catchError, map, Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule
  ],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.css'
})
export class DocumentListComponent implements AfterViewInit {


  private _documents: string[][] = [];

  constructor(private router: Router, private route: ActivatedRoute, protected httpClient: HttpClient) {

  }


  getBaseUrl() {
    return "https://assistmeai.nblotti.org/files/";
  }


  onDisplayPDF($event: MouseEvent, documentId: string) {
    this.router.navigate(['/docs', documentId], { relativeTo: this.route });

    $event.preventDefault()
  }

  public getDocuments(): string[][] {
    return this._documents;
  }

  ngAfterViewInit(): void {

    this.fetchData().subscribe(value =>
      this._documents = value);
  }

  fetchData(): Observable<string[][]> {
    return this.httpClient.get<any>(this.getBaseUrl() + 'list').pipe(
      map(response => JSON.parse(response))
    );
  }

}
