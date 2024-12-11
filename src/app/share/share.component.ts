import {Component, computed, OnInit, signal, WritableSignal} from '@angular/core';
import {StateManagerService} from "../state-manager.service";
import {SharedGroup} from "./SharedGroup";
import {FormsModule} from "@angular/forms";
import {User} from "./User";
import {Document} from "./Document";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {GlobalsService} from "../globals.service";

import {debounceTime, map, Observable} from "rxjs";
import {NgbHighlight, NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {DocumentService, DocumentType} from "../document.service";
import {UserContextService} from "../auth/user-context.service";
import {SharedGroupUser} from "./SharedGroupUser";
import {SharedGroupDocument} from "./SharedGroupDocument";


@Component({
  selector: 'app-share',
  standalone: true,
  imports: [FormsModule, NgbTypeahead, NgbHighlight],
  templateUrl: './share.component.html',
  styleUrl: './share.component.css'
})
export class ShareComponent implements OnInit {


  /*********************************************************************************************************************/

  protected groups: WritableSignal<SharedGroup[]> = signal([]);
  protected selectedGroup: WritableSignal<SharedGroup | null> = signal(null);
  protected groupName: WritableSignal<string> = signal("");
  protected isInputValid = computed(() => {
    let group = this.groupName();
    if (group == null)
      return false;
    return group.trim().length > 0;
  })
  /*********************************************************************************************************************/
  protected documents: WritableSignal<Document[] | null> = signal(null);
  protected documentAddedModel: WritableSignal<Document | null> = signal(null);
  protected isDocumentAddedModelValid = computed(() => {
    let doc = this.documentAddedModel();
    if (doc == null || (doc as Document).name == undefined)
      return false;
    return doc.name.trim().length > 0;
  })
  /*********************************************************************************************************************/
  protected userAddedModel: WritableSignal<User | null> = signal(null);

  protected isUerAddedModelValid = computed(() => {
    let user = this.userAddedModel();
    if (user == null || (user as User).cn == undefined)
      return false;
    return user.cn.trim().length > 0;
  })
  protected users: WritableSignal<User[] | null> = signal(null);
  private groupUrl: string
  private sharedGroupDocuments: SharedGroupDocument[] = [];
  private sharedGroupDocumentUrl: string;
  private documentList: Document[] = []
  private chatUserList: User[] = []
  private userUrl: string
  private sharedGroupUsers: SharedGroupUser[] = [];
  private sharedGroupUserUrl: string

  constructor(private statemanagerService: StateManagerService, private httpClient: HttpClient,
              private globalsService: GlobalsService, private documentService: DocumentService,
              private userContextService: UserContextService,) {

    this.userUrl = this.globalsService.serverAssistmeBase + "user/"
    this.groupUrl = this.globalsService.serverAssistmeBase + "sharedgroup/"
    this.sharedGroupUserUrl = this.globalsService.serverAssistmeBase + "sharedgroupuser/"
    this.sharedGroupDocumentUrl = this.globalsService.serverAssistmeBase + "sharedgroupdocument/"

  }

  ngOnInit(): void {

    this.statemanagerService.chatEnabled.set(false);

    this.documentService.fetchDocuments(this.userContextService.getUserID()(), DocumentType.ALL).subscribe({
      next: (result: Document[]) => {

        this.documentList = result;
      },
      error: (error) => {
        console.error('Load failed:', error);
      },
      complete: () => {
      }
    });

    this.httpClient.get<User[]>(this.userUrl).subscribe({
      next: (result) => {

        this.chatUserList = result;
      },
      error: (error) => {
        console.error('Load failed:', error);
      },
      complete: () => {
      }
    });
    this.reload();
  }

  userFormatter = (result: User) => result.givenName;

  userSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map((term) =>
        term === ''
          ? []
          : this.chatUserList
            .filter(
              (v) =>
                v.givenName.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 10)
      )
    );

  documentSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      map((term) =>
        term === ''
          ? []
          : this.documentList
            .filter(
              (v) =>
                v.name.toLowerCase().indexOf(term.toLowerCase()) > -1
            )
            .slice(0, 10)
      )
    );
  documentFormatter = (result: Document) => result.name;


  reload() {
    this.groupName.set("");
    this.userAddedModel.set(null)
    this.documentAddedModel.set(null)
    this.loadGroups();

  }


  loadGroups() {

    let url = this.groupUrl + "owner/" + this.userContextService.getUserID()() + "/"
    this.httpClient.get<SharedGroup[]>(url)
      .subscribe({
        next: (groups) => {

          this.groups.set(groups);
          if (this.groups().length > 0) {
            let sharedGroup = this.groups()[this.groups().length - 1];
            this.selectedGroup.set(sharedGroup)
            this.loadUserForGroup(sharedGroup.id)
            this.loadDocumentForGroup(sharedGroup.id)
          }
        },
        error: (err) => {
          console.error(err);
        }
      });

  }


  selectGroup(group_id: string) {
    let currentGroup = this.getGroupByID(group_id)
    if (currentGroup == undefined) {
      return;
    }
    this.selectedGroup.set(currentGroup);
    this.loadUserForGroup(currentGroup.id)
    this.loadDocumentForGroup(currentGroup.id)

  }

  addUserToGroup() {

    let group_id = this.selectedGroup()?.id;
    if (group_id == null)
      return
    let user = this.userAddedModel();
    if (user == null)
      return;
    let newGroup = new SharedGroupUser(group_id, user.cn, this.getCurrentDateFormatted())


    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.post(this.sharedGroupUserUrl, newGroup, {headers: headers})
      .subscribe({
        next: (assistant) => {
          this.loadUserForGroup(group_id)
          this.userAddedModel.set(null);
        },
        error: (err) => {
          console.error(err);
        }

      });
  }

  addDocumentToGroup() {
    let group_id = this.selectedGroup()?.id;
    if (group_id == null)
      return
    let document = this.documentAddedModel()
    if (document == null)
      return;
    let newGroup = new SharedGroupDocument(group_id, document.id.toString(), this.getCurrentDateFormatted())


    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.post(this.sharedGroupDocumentUrl, newGroup, {headers: headers})
      .subscribe({
        next: (assistant) => {
          this.loadDocumentForGroup(group_id)
          this.documentAddedModel.set(null)
        },
        error: (err) => {
          console.error(err);
        }

      });
  }

  addGroup() {
    let newGroup = new SharedGroup(this.groupName(), this.userContextService.getUserID()(), this.getCurrentDateFormatted())

    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.post(this.groupUrl, newGroup, {headers: headers})
      .subscribe({
        next: (assistant) => {
          this.reload();
        },
        error: (err) => {
          console.error(err);
        }

      });

  }

  getCurrentDateFormatted(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onChangeGroupName(id: string) {
    //TODO NBL update the backend
    let currentGroup = this.getGroupByID(id)
    if (currentGroup == undefined) {
      return;
    }
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.put(this.groupUrl, currentGroup, {headers: headers})
      .subscribe({
        next: (assistant) => {
          this.reload();
        },
        error: (err) => {
          console.error(err);
        }

      });


  }

  getGroupByID(id: string) {
    return this.groups().find(group => group.id == id);
  }


  deleteUser(groupId: string | undefined, userId: string) {


    let deleteGroup = this.sharedGroupUsers.find(groupUser => {
      return groupUser.group_id == groupId && groupUser.user_id == userId
    });

    if (deleteGroup == null)
      return;
    let url = this.sharedGroupUserUrl + deleteGroup.id + "/"
    this.httpClient.delete(url).subscribe({
      next: (assistant) => {
        if (groupId != null)
          this.loadUserForGroup(groupId)
      },
      error: (err) => {
        console.error(err);
      }

    });

  }

  deleteGroup(groupId: string) {
    console.log("User ID to delete:", groupId);
    let url = this.groupUrl + groupId + "/"
    this.httpClient.delete(url).subscribe({
      next: (assistant) => {
        this.reload();
      },
      error: (err) => {
        console.error(err);
      }

    });

  }

  deleteDocument(groupId: string | undefined, documentId: string) {
    let deleteGroup = this.sharedGroupDocuments.find(groupDocument => {
      return groupDocument.group_id == groupId && groupDocument.document_id == documentId
    });

    if (deleteGroup == null)
      return;
    this.statemanagerService.blurWindow.set(true);
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    this.httpClient.delete(this.sharedGroupDocumentUrl + deleteGroup.id + "/", {headers}).subscribe({
      next: (assistant) => {
        if (groupId != null)
          this.loadDocumentForGroup(groupId)
          this.statemanagerService.blurWindow.set(false)
      },
      error: (err) => {
        console.error(err);
        this.statemanagerService.blurWindow.set(false)
      }

    }
  )
    ;

  }

  private loadUserForGroup(id: string | undefined) {
    if (id == undefined)
      return;

    let url = this.sharedGroupUserUrl + "group/" + id + "/"
    this.httpClient.get<SharedGroupUser[]>(url)
      .subscribe({
        next: (groups) => {
          let users: User[] = [];
          groups.forEach(group => {
            let user = this.chatUserList.find(value => {
              return value.cn == group.user_id
            })
            if (user != undefined)
              users.push(user)
          })
          this.users.set(users);
          this.sharedGroupUsers = groups;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  private loadDocumentForGroup(id: string | undefined) {
    if (id == undefined)
      return;

    let url = this.sharedGroupDocumentUrl + "group/" + id + "/"
    this.httpClient.get<SharedGroupDocument[]>(url)
      .subscribe({
        next: (groups) => {
          let documents: Document[] = [];
          groups.forEach(group => {
            let document = this.documentList.find(value => {
              return value.id == group.document_id
            })
            if (document != undefined)
              documents.push(document)
          })
          this.documents.set(documents);
          this.sharedGroupDocuments = groups;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}


