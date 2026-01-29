import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { By } from '@angular/platform-browser';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: ToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [ToastService]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('não deve renderizar nada se não houver toasts', () => {
    const toastsContainer = fixture.debugElement.queryAll(By.css('.animate-slide-in'));
    expect(toastsContainer.length).toBe(0);
  });

  it('deve renderizar um toast de SUCESSO com as classes corretas', () => {
    toastService.show('Sucesso total', 'success');
    fixture.detectChanges();

    const toastEl = fixture.debugElement.query(By.css('.animate-slide-in'));

    expect(toastEl.nativeElement.textContent).toContain('Sucesso total');

    expect(toastEl.classes['border-green-500']).toBe(true);

    const icon = toastEl.query(By.css('.fa-circle-check'));
    expect(icon).toBeTruthy();
    expect(icon.parent?.classes['text-green-500']).toBe(true);
  });

  it('deve renderizar um toast de ERRO com as classes corretas', () => {
    toastService.show('Erro fatal', 'error');
    fixture.detectChanges();

    const toastEl = fixture.debugElement.query(By.css('.animate-slide-in'));

    expect(toastEl.classes['border-red-500']).toBe(true);

    const icon = toastEl.query(By.css('.fa-circle-exclamation'));
    expect(icon).toBeTruthy();
  });

  it('deve chamar o remove ao clicar no botão de fechar (X)', () => {
    toastService.show('Fechar isso');
    fixture.detectChanges();

    const removeSpy = vi.spyOn(toastService, 'remove');

    const closeBtn = fixture.debugElement.query(By.css('button'));
    closeBtn.triggerEventHandler('click', null);

    expect(removeSpy).toHaveBeenCalled();

    fixture.detectChanges();
    const toasts = fixture.debugElement.queryAll(By.css('.animate-slide-in'));
    expect(toasts.length).toBe(0);
  });

  it('deve renderizar múltiplos toasts', () => {
    toastService.show('Um');
    toastService.show('Dois');
    toastService.show('Três');
    fixture.detectChanges();

    const toasts = fixture.debugElement.queryAll(By.css('.animate-slide-in'));
    expect(toasts.length).toBe(3);
  });
});