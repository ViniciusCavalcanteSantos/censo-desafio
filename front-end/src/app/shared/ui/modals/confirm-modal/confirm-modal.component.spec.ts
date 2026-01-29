import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve exibir o título passado via Input', () => {
    const testTitle = 'Confirmação';
    component.title = testTitle;
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h3')).nativeElement;
    expect(titleElement.textContent).toContain(testTitle);
  });

  it('deve emitir evento "confirm" ao clicar no botão de confirmação', () => {
    const confirmSpy = vi.spyOn(component.confirm, 'emit');

    const confirmBtn = fixture.debugElement.query(By.css('button.bg-red-600'));
    confirmBtn.triggerEventHandler('click', null);

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('deve emitir evento "cancel" ao clicar no botão de cancelar', () => {
    const cancelSpy = vi.spyOn(component.cancel, 'emit');

    const cancelBtn = fixture.debugElement.query(By.css('button.bg-white'));
    cancelBtn.triggerEventHandler('click', null);

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('deve emitir evento "cancel" ao clicar no backdrop (fundo escuro)', () => {
    const cancelSpy = vi.spyOn(component.cancel, 'emit');

    const backdrop = fixture.debugElement.query(By.css('.fixed'));
    backdrop.triggerEventHandler('click', null);

    expect(cancelSpy).toHaveBeenCalled();
  });
});
