import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) {
  }

  uploadFile(file: File,perimeter:string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('perimeter', perimeter);
    const headers = new HttpHeaders();
    // If you need to add custom headers, you can do so here
    // headers.append('Authorization', 'Bearer token');

    return this.http.post<any>('https://assistmeai.nblotti.org/files/', formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
