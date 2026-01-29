import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/instituicao_usuarios`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve buscar usuários (getUsers) com parâmetros corretos', () => {
    const mockResponse = { data: [], meta: { total: 0 } };

    service.getUsers(1, 10, 'teste', 'admin', 'ativo').subscribe(res => {
      expect(res).toEqual(mockResponse as any);
    });

    const req = httpMock.expectOne(req =>
      req.url === `${apiUrl}/listar` &&
      req.params.get('search') === 'teste' &&
      req.params.get('status') === 'ativo'
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('inst_codigo')).toBe('1');

    req.flush(mockResponse);
  });

  it('deve atualizar usuário (updateUser) enviando FormData corretamente', () => {
    const mockUser: User = {
      inst_usua_id: 1,
      usua_nome: 'Teste',
      usua_email: 'teste@email.com',
      inst_usua_codigo: '123',
      usuario_perfil: 'Admin',
      usua_cpf: '000.000.000-00',
      can_be_removed: 0,
      is_blacklisted: 0,
    };

    service.updateUser(mockUser, null).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/salvar`);
    expect(req.request.method).toBe('POST');

    const body = req.request.body as FormData;

    expect(body.get('usuario_nome')).toBe('Teste');
    expect(body.get('usuario_email')).toBe('teste@email.com');
    expect(body.get('usuario_cpf')).toBe('000.000.000-00');

    expect(req.request.headers.has('Content-Type')).toBe(false);

    req.flush({ success: true });
  });

  it('deve remover da blacklist (removeFromBlacklist)', () => {
    const email = 'teste@email.com';

    service.removeFromBlacklist(email).subscribe(res => {
      expect(res).toBeTruthy();
    });

    const req = httpMock.expectOne(`${apiUrl}/blacklist/remover`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ email });

    req.flush({ success: true });
  });
});