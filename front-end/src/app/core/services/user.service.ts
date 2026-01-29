import {inject, Injectable} from '@angular/core';
import {map} from 'rxjs';
import {User} from '../models/user.interface';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../../environments/environment";

@Injectable({providedIn: 'root'})
export class UserService {
  private apiUrl = `${environment.apiUrl}/instituicao_usuarios`;
  private http: HttpClient = inject(HttpClient);

  private headers = new HttpHeaders({
    'inst_codigo': '1',
    'Content-Type': 'application/json'
  });

  getUsers() {
    return this.http.get<any>(`${this.apiUrl}/listar`, {headers: this.headers})
      .pipe(map((response: { data: any; }) => response.data || []));
  }

  updateUser(user: User) {

    return this.http.post(`${this.apiUrl}/salvar`, user, {headers: this.headers});
  }

  removeFromBlacklist(email: string) {
    return this.http.delete(`${this.apiUrl}/blacklist/remover`, {
      headers: this.headers,
      body: { email }
    });
  }
}
