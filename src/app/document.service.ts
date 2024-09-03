import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {GlobalsService} from "./globals.service";
import {Document} from "./dashboard/Document";
import {Conversation} from "./dashboard/Conversation";
import {FileType} from "./file-upload-dialog/file-upload-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {


  documents_base_url: string;
  jobs_base_url: string;

  constructor(private http: HttpClient, private globalsService: GlobalsService) {

    this.documents_base_url = globalsService.serverAssistmeBase + "document/"
    this.jobs_base_url = globalsService.serverJobBase
  }

  uploadFile(file: File, fileType : FileType, perimeter: string): Observable<HttpEvent<any>> {
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
    let url = this.documents_base_url + "users/" + perimeter + "/documents?type=" + type;
    return this.http.get<Document[]>(url);
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
}

export enum DocumentType {
  SUMMARY = 'SUMMARY',
  DOCUMENT = 'DOCUMENT'
}

export enum DocumentStatus {
  NONE = "NONE",
  REQUESTED = "REQUESTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"

}
