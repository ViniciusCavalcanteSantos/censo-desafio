import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditUserModalComponent } from './edit-user-modal.component';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { User } from '../../../core/models/user.interface';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('EditUserModalComponent', () => {
  let component: EditUserModalComponent;
  let fixture: ComponentFixture<EditUserModalComponent>;
  let userServiceMock: any;
  let toastServiceMock: any;

  const mockUser: User = {
    inst_usua_id: 1,
    usua_nome: 'João Silva',
    usua_email: 'joao@teste.com',
    inst_usua_codigo: '12345',
    usuario_perfil: 'Professor',
    usua_cpf: '111.222.333-44',
    usua_data_nascimento: '1990-01-01',
    usua_sexo: 'M',
    can_be_removed: 1,
    is_blacklisted: 1,
    blacklist_deadline: '2024-12-31T23:59:59'
  };

  beforeEach(async () => {
    userServiceMock = {
      updateUser: vi.fn().mockReturnValue(of({ success: true })),
      removeFromBlacklist: vi.fn().mockReturnValue(of({ success: true }))
    };

    toastServiceMock = {
      show: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [EditUserModalComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditUserModalComponent);
    component = fixture.componentInstance;

    component.user = mockUser;

    fixture.detectChanges();
  });

  it('deve criar o componente e inicializar com os dados do usuário', () => {
    expect(component).toBeTruthy();
    expect(component.editableUser.usua_nome).toBe(mockUser.usua_nome);
    expect(component.editableUser.usua_email).toBe(mockUser.usua_email);
  });

  it('deve processar a seleção de arquivo (onFileSelected)', () => {
    const mockReader = {
      readAsDataURL: vi.fn(),
      onload: null as any,
      result: 'data:image/png;base64,fakeimage'
    };

    vi.spyOn(window, 'FileReader').mockImplementation(function() {
      return mockReader;
    } as any);

    const file = new File([''], 'avatar.png', { type: 'image/png' });
    const event = { target: { files: [file] } };

    component.onFileSelected(event);

    if (mockReader.onload) {
      mockReader.onload({ target: { result: mockReader.result } } as any);
    }

    expect(component.selectedFile).toBe(file);
    expect(component.previewUrl).toBe('data:image/png;base64,fakeimage');
  });

  it('deve chamar o serviço de atualização ao salvar com sucesso', () => {
    const closeSpy = vi.spyOn(component.close, 'emit');
    const updateSpy = vi.spyOn(component.userUpdated, 'emit');

    component.editableUser.usua_nome = 'João Editado';

    component.save();

    expect(userServiceMock.updateUser).toHaveBeenCalledWith(component.editableUser, component.selectedFile);
    expect(toastServiceMock.show).toHaveBeenCalledWith('Usuário salvo com sucesso!', 'success');
    expect(updateSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('deve lidar com erro ao salvar', () => {
    const errorMsg = 'Erro de validação';
    userServiceMock.updateUser.mockReturnValue(throwError(() => ({ error: { message: errorMsg } })));

    component.save();

    expect(toastServiceMock.show).toHaveBeenCalledWith(errorMsg, 'error');
  });

  it('deve exibir modal de confirmação ao clicar em desbloquear blacklist', () => {
    component.handleBlacklistClick();

    expect(component.showConfirm()).toBe(true);
  });

  it('não deve exibir modal de confirmação se o usuário não puder ser removido', () => {
    component.user = { ...mockUser, can_be_removed: 0 };
    fixture.detectChanges(); // Atualiza signals/inputs

    component.handleBlacklistClick();

    expect(component.showConfirm()).toBe(false);
  });

  it('deve executar a remoção da blacklist corretamente', () => {
    component.executeRemoval();

    expect(userServiceMock.removeFromBlacklist).toHaveBeenCalledWith(mockUser.usua_email);
    expect(component.showConfirm()).toBe(false);
    expect(component.editableUser.is_blacklisted).toBe(0);
    expect(toastServiceMock.show).toHaveBeenCalledWith('Usuário liberado com sucesso!', 'success');
  });
});