import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {PaginatedResponse, User} from '../models/user.interface';
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

  getUsers(page: number = 1, limit: number = 10, search: string = '', perfil: string = '', status: string = ''): Observable<PaginatedResponse<User>> {
    const params: any = {
      inst_codigo: 1,
      page: page,
      limit: limit
    };

    if (search) params.search = search;
    if (perfil) params.perfil = perfil;
    if (status && status !== 'todos') params.status = status;

    return this.http.get<PaginatedResponse<User>>(`${this.apiUrl}/listar`, {
      headers: this.headers,
      params
    });
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
