import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpResponse} from "@angular/common/http";
import {catchError, map, Observable, throwError} from "rxjs";
import {GlobalsService} from "./globals.service";
import {CategoryDocument, Document} from "./Document";
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
    this.jobs_base_url = globalsService.serverAssistmeBase + "job/request"
  }

  uploadFile(file: File, fileType: DocumentType, perimeter: string, focus_only: string = "false"): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('owner', perimeter);
    formData.append('type', fileType);
    formData.append('focus_only', focus_only);

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


  fetchCategoryDocuments(perimeter: string, category_id: string): Observable<CategoryDocument[]> {
    let url = this.documents_base_url + "category/" + perimeter + "/" + category_id;
    return this.http.get<CategoryDocument[]>(url).pipe(
      map((documents: CategoryDocument[]) => {
        // Modify one element of the array
        for (let document of documents as CategoryDocument[]) {
          document.document_type = AssistantDocumentType.CATEGORY_DOCUMENTS
        }
        return documents;
      })
    );

  }

  requestSummary(user: string, id: string, prompt: string) {

   const promptJson = { "prompt": prompt };

// Convert the object to a JSON string using JSON.stringify
    const jsonData = {
      source: id,
      owner: user,
      job_type: "SUMMARY", // Optional since it's the default on the backend
      payload: { prompt }
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
      "job_type": "SCRAP"
    };


    let url = this.jobs_base_url
    return this.http.post<string>(url, jsonData);
  }

}

export enum DocumentType {
  SUMMARY = 'SUMMARY',
  DOCUMENT = 'DOCUMENT',
  TEMPLATE = 'TEMPLATE',
  ALL = 'ALL'
}

export enum DocumentStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"

}
