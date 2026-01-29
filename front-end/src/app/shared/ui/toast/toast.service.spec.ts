import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { vi } from 'vitest';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastService]
    });
    service = TestBed.inject(ToastService);

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve adicionar um toast (show)', () => {
    service.show('Mensagem de Teste', 'success');

    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe('Mensagem de Teste');
    expect(toasts[0].type).toBe('success');
  });

  it('deve remover um toast pelo ID (remove)', () => {
    service.show('Toast 1');
    service.show('Toast 2');

    expect(service.toasts().length).toBe(2);

    service.remove(0);

    const currentToasts = service.toasts();
    expect(currentToasts.length).toBe(1);
    expect(currentToasts[0].id).toBe(1);
  });

  it('deve remover automaticamente após o tempo padrão (4000ms)', () => {
    service.show('Auto remove');

    expect(service.toasts().length).toBe(1);

    // Avança 3999ms (ainda deve existir)
    vi.advanceTimersByTime(3999);
    expect(service.toasts().length).toBe(1);

    // Avança +1ms (total 4000ms - deve sumir)
    vi.advanceTimersByTime(1);
    expect(service.toasts().length).toBe(0);
  });

  it('deve respeitar duração customizada', () => {
    service.show('Rápido', 'info', 1000);

    expect(service.toasts().length).toBe(1);

    // Avança 1000ms
    vi.advanceTimersByTime(1000);
    expect(service.toasts().length).toBe(0);
  });
});