import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpResponse} from "@angular/common/http";
import {catchError, map, Observable, throwError} from "rxjs";
import {GlobalsService} from "./globals.service";
import {Document, SharedDocument} from "./dashboard-main-screen/Document";
import {FileType} from "./dashboard-document-upload/file-upload-dialog.component";
import {AssistantDocumentType} from "./assistant/assistant.service";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {


  documents_base_url: string;
  all_user_documents_base_url: string
  jobs_base_url: string;

  constructor(private http: HttpClient, private globalsService: GlobalsService) {

    this.documents_base_url = globalsService.serverAssistmeBase + "document/"
    this.all_user_documents_base_url = globalsService.serverAssistmeBase + "/users/%s/documents/"
    this.jobs_base_url = globalsService.serverJobBase
  }

  uploadFile(file: File, fileType: FileType, perimeter: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('owner', perimeter);

    return this.http.post<any>(this.documents_base_url, formData, {
      reportProgress: true, observe: 'events'
    });
  }

  deleteDocument(blobId: number): Observable<any> {
    let url = this.documents_base_url + blobId + "/"
    return this.http.delete<any>(url);
  }

  fetchDocuments(perimeter: string, type: DocumentType): Observable<Document[]> {
    let url = this.documents_base_url + "user/" + perimeter + "?type=" + type;
    return this.http.get<Document[]>(url);
  }

  fetchSharedDocuments(perimeter: string): Observable<SharedDocument[]> {
    let url = this.documents_base_url + "shared/" + perimeter + "/";

    return this.http.get<SharedDocument[]>(url).pipe(
      map((documents: SharedDocument[]) => {
        // Modify one element of the array
        for (let document of documents as SharedDocument[]) {
          document.document_type = AssistantDocumentType.SHARED_DOCUMENTS
        }
        return documents;
      })
    );


    return this.http.get<SharedDocument[]>(url);
  }


  requestSummary(user: string, id: string) {
    const jsonData = {
      "source": id,
      "owner": user,
      "status": "REQUESTED"
    };


    let url = this.jobs_base_url
    return this.http.post<string>(url, jsonData);


  }

  checkUrlType(url: string): Observable<string> {
    return this.http.head(url, {observe: 'response'}).pipe(
      map((response: HttpResponse<any>) => {
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
          return contentType;
        } else {
          throw new Error('Content-Type not specified');
        }
      }),
      catchError((error) => {
        console.error('Error checking URL type:', error);
        return throwError(error);
      })
    );
  }

  requestScrap(user: string, url_path: string) {
    const jsonData = {
      "source": url_path,
      "owner": user,
      "job_type": "SCRAP",
      "status": "REQUESTED"
    };


    let url = this.jobs_base_url
    return this.http.post<string>(url, jsonData);
  }
}

export enum DocumentType {
  SUMMARY = 'SUMMARY',
  DOCUMENT = 'DOCUMENT',
  ALL = 'ALL'
}

export enum DocumentStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"

}
