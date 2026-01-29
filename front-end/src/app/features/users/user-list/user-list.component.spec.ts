import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/models/user.interface';
import { vi } from 'vitest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let userServiceMock: any;
  let toastServiceMock: any;

  const mockUsers: User[] = [
    {
      inst_usua_id: 1,
      usua_nome: 'Ana Souza',
      usua_email: 'ana@teste.com',
      inst_usua_codigo: '1001',
      usuario_perfil: 'Professor',
      usua_cpf: '111.111.111-11',
      can_be_removed: 1,
      is_blacklisted: 0
    },
    {
      inst_usua_id: 2,
      usua_nome: 'Bruno Lima',
      usua_email: 'bruno@teste.com',
      inst_usua_codigo: '1002',
      usuario_perfil: 'Administrador',
      usua_cpf: '222.222.222-22',
      can_be_removed: 0,
      is_blacklisted: 1,
      blacklist_deadline: '2025-01-01'
    }
  ];

  const mockResponse = {
    data: mockUsers,
    meta: { total: 2, current_page: 1, per_page: 7 }
  };

  beforeEach(async () => {
    userServiceMock = {
      getUsers: vi.fn().mockReturnValue(of(mockResponse)),
      removeFromBlacklist: vi.fn().mockReturnValue(of({ success: true }))
    };

    toastServiceMock = {
      show: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent], // Standalone component
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve criar o componente e carregar usuários inicialmentes', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(userServiceMock.getUsers).toHaveBeenCalled();
    expect(component.users().length).toBe(2);
    expect(component.totalItems()).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('deve lidar com erro ao carregar usuários', () => {
    // Espiona e silencia o console.error para não sujar o terminal
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    userServiceMock.getUsers.mockReturnValue(throwError(() => new Error('Erro API')));

    fixture.detectChanges();

    expect(component.users().length).toBe(0);
    expect(toastServiceMock.show).toHaveBeenCalledWith('Erro ao carregar usuários. Tente novamente.', 'error');
    expect(component.isLoading()).toBe(false);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('deve realizar busca com debounce (delay)', () => {
    fixture.detectChanges();

    userServiceMock.getUsers.mockClear();

    component.onSearchInput({ target: { value: 'Ana' } });

    expect(userServiceMock.getUsers).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(component.searchQuery()).toBe('Ana');
    expect(component.currentPage()).toBe(1); // Resetou página
    expect(userServiceMock.getUsers).toHaveBeenCalledWith(
      1,
      expect.any(Number),
      'Ana',
      expect.any(String),
      expect.any(String)
    );
  });

  it('deve resetar a página ao mudar filtros', () => {
    fixture.detectChanges();
    component.currentPage.set(5);

    component.selectedPerfil.set('Professor');
    component.onFilterChange();

    expect(component.currentPage()).toBe(1);
    expect(userServiceMock.getUsers).toHaveBeenCalled();
  });

  it('deve calcular corretamente as iniciais do nome (getInitials)', () => {
    expect(component.getInitials('Vinicius Cavalcante')).toBe('VC');
    expect(component.getInitials('Ana')).toBe('A');
    expect(component.getInitials('')).toBe('');
  });

  it('deve filtrar usuários localmente via computed (filteredUsers)', () => {
    fixture.detectChanges();

    component.searchQuery.set('Bruno');

    const filtrados = component.filteredUsers();

    expect(filtrados.length).toBe(1);
    expect(filtrados[0].usua_nome).toBe('Bruno Lima');
  });

  it('deve abrir modal de confirmação apenas se usuário puder ser removido da blacklist', () => {
    fixture.detectChanges();

    const blockedUser = mockUsers[1];
    component.handleBlacklistAction(blockedUser);
    expect(component.showConfirmModal()).toBe(false);

    const removableUser = { ...mockUsers[0], is_blacklisted: 1, can_be_removed: 1 };
    component.handleBlacklistAction(removableUser);

    expect(component.showConfirmModal()).toBe(true);
    expect(component.userPendingRemoval()).toEqual(removableUser);
  });

  it('deve confirmar remoção da blacklist e recarregar lista', () => {
    fixture.detectChanges();

    const userToRemove = { ...mockUsers[0], is_blacklisted: 1 };
    component.userPendingRemoval.set(userToRemove);

    component.onConfirmRemoval();

    expect(userServiceMock.removeFromBlacklist).toHaveBeenCalledWith(userToRemove.usua_email);
    expect(toastServiceMock.show).toHaveBeenCalledWith(expect.stringContaining('sucesso'), 'success');
    expect(component.showConfirmModal()).toBe(false);

    expect(userServiceMock.getUsers).toHaveBeenCalledTimes(2);
  });
});