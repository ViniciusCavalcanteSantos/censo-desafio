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

  updateUser(user: User, file: File | null): Observable<any> {
    const formData = new FormData();

    formData.append('inst_usua_id', user.inst_usua_id.toString());
    formData.append('usuario_nome', user.usua_nome);
    formData.append('usuario_email', user.usua_email);
    formData.append('usuario_codigo', user.inst_usua_codigo);
    formData.append('usuario_funcao', user.usuario_perfil);

    if (user.usua_cpf) formData.append('usuario_cpf', user.usua_cpf);
    if (user.usua_sexo) formData.append('usuario_sexo', user.usua_sexo);
    if (user.usua_data_nascimento) formData.append('data_nascimento', user.usua_data_nascimento);

    if (file) {
      formData.append('usua_foto', file);
    }

    // Clone os headers mas remova o Content-Type para deixar o browser definir
    let headers = this.headers.delete('Content-Type');

    return this.http.post(`${this.apiUrl}/salvar`, formData, { headers });
  }

  removeFromBlacklist(email: string) {
    return this.http.delete(`${this.apiUrl}/blacklist/remover`, {
      headers: this.headers,
      body: { email }
    });
  }
}
