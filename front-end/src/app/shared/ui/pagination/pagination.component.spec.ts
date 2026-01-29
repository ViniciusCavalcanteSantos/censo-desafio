import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;

    component.current = 1;
    component.total = 100;
    component.size = 10;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve calcular o total de páginas corretamente', () => {
    component.total = 55;
    component.size = 10;
    fixture.detectChanges();

    expect(component.totalPages()).toBe(6);
  });

  it('não deve renderizar nada se houver apenas 1 página', () => {
    component.total = 5;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('.flex'));
    expect(container).toBeNull();
  });

  it('deve desabilitar o botão "Anterior" na primeira página', () => {
    component.current = 1;
    fixture.detectChanges();

    const prevBtn = fixture.debugElement.query(By.css('button:first-child'));
    expect(prevBtn.nativeElement.disabled).toBe(true);
  });

  it('deve desabilitar o botão "Próximo" na última página', () => {
    component.total = 50;
    component.current = 5;
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nextBtn = buttons[buttons.length - 1]; // Último botão da lista

    expect(nextBtn.nativeElement.disabled).toBe(true);
  });

  it('deve emitir evento de troca de página ao clicar em "Próximo"', () => {
    const pageChangeSpy = vi.spyOn(component.pageChange, 'emit');
    component.current = 1;
    component.total = 50;
    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const nextBtn = buttons[buttons.length - 1];

    nextBtn.triggerEventHandler('click', null);

    expect(pageChangeSpy).toHaveBeenCalledWith(2);
  });

  it('deve gerar corretamente os números de página com reticências (logica visiblePages)', () => {
    component.current = 5;
    component.total = 100;
    fixture.detectChanges();

    const pages = component.visiblePages();

    expect(pages).toEqual([1, -1, 4, 5, 6, -1, 10]);

    const dotsElements = fixture.debugElement.queryAll(By.css('span.text-gray-400'));
    expect(dotsElements.length).toBe(2);
    expect(dotsElements[0].nativeElement.textContent).toContain('...');
  });

  it('não deve emitir evento ao clicar na página atual', () => {
    const pageChangeSpy = vi.spyOn(component.pageChange, 'emit');
    component.current = 1;
    fixture.detectChanges();

    const page1Btn = fixture.debugElement.queryAll(By.css('button'))
      .find(btn => btn.nativeElement.textContent.trim() === '1');

    page1Btn?.triggerEventHandler('click', null);

    expect(pageChangeSpy).not.toHaveBeenCalled();
  });
});