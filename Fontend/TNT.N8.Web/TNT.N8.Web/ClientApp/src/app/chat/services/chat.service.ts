import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { TakeDataFireBaseByUserIdResult, TakeListEmployeeByUserNameParameter } from '../models/chat.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private httpClient: HttpClient) {
  }

  getDataFireBase() {
    let url = localStorage.getItem('ApiEndPoint') + "/api/FireBase/takeDataFireBaseByUserId";
    return this.httpClient.post(url, {}).pipe(
      map((response: TakeDataFireBaseByUserIdResult) => {
        return response;
      }));
  }

  createDataFireBase(roomName: string, otherId: string, sos: boolean) {
    let url = localStorage.getItem('ApiEndPoint') + "/api/FireBase/createDataFireBase";
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, { RoomName: roomName, OtherId: otherId, Sos: sos }).toPromise()
        .then((response) => {
          resolve(response);
        });
    });
  }

  getUserProfileByRoomName(listRoomName: string[], sos: boolean) {
    let url = localStorage.getItem('ApiEndPoint') + '/api/auth/getUserProfileByRoomName';
    return new Promise((resolve, reject) => {
      return this.httpClient.post(url, { listRoomName: listRoomName, Sos: sos }).toPromise()
        .then((response: Response) => {
          resolve(response);
        });
    });
  }

  takeListEmployeeByUsername(filterText: string, sos: boolean): Observable<TakeListEmployeeByUserNameParameter> {
    let url = localStorage.getItem('ApiEndPoint') + '/api/employee/takeListEmployeeByUsername';
    return this.httpClient.post(url, { FilterText: filterText, Sos: sos }).pipe(
      map((response: TakeListEmployeeByUserNameParameter) => {
        return response;
      }));
  }

  thongBaoDayChat(receiverId: string, sos: boolean){
    let url = localStorage.getItem('ApiEndPoint') + '/api/FireBase/thongBaoDayChat';
    return this.httpClient.post(url, { ReceiverId: receiverId, Sos: sos }).pipe(
      map((response: any) => {
        return response;
      }));
  }
}