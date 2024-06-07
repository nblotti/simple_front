import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {


  documents_base_url = "https://assistmeai.nblotti.org/document/";

  constructor(private http: HttpClient) {
  }

  uploadFile(file: File, perimeter: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('perimeter', perimeter);

    return this.http.post<any>(this.documents_base_url, formData, {
      reportProgress: true, observe: 'events'
    });
  }

  deleteDocument(blobId: string): Observable<any> {
    let url = this.documents_base_url + blobId + "/"
    return this.http.delete<any>(url);
  }

  fetchDocuments(): Observable<any> {
    let url = this.documents_base_url
    return this.http.get<any>(url);
  }


}
