import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TooltipDirective } from './tooltip.directive';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <button [appTooltip]="'Texto Simples'" class="host-text">
      Hover me
    </button>

    <ng-template #myTemplate let-data>
      <span class="template-content">Olá, {{ data?.name }}</span>
    </ng-template>

    <div [appTooltip]="myTemplate" [tooltipContext]="{ name: 'Vinicius' }" class="host-template">
      Hover Template
    </div>
  `,
  imports: [TooltipDirective],
  standalone: true
})
class TestHostComponent {}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let des: DebugElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TooltipDirective]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    des = fixture.debugElement.queryAll(By.directive(TooltipDirective));
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelectorAll('.fixed.z-50').forEach(el => el.remove());
  });

  it('deve criar uma instância da diretiva', () => {
    const directive = des[0].injector.get(TooltipDirective);
    expect(directive).toBeTruthy();
  });

  it('deve exibir tooltip de TEXTO ao passar o mouse (mouseenter)', () => {
    const btn = des[0];

    btn.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();

    const tooltip = document.querySelector('.fixed.z-50');
    expect(tooltip).toBeTruthy();
    expect(tooltip?.textContent).toContain('Texto Simples');
  });

  it('deve esconder o tooltip ao tirar o mouse (mouseleave)', () => {
    const btn = des[0];

    btn.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();
    expect(document.querySelector('.fixed.z-50')).toBeTruthy();

    btn.triggerEventHandler('mouseleave', null);
    fixture.detectChanges();
    expect(document.querySelector('.fixed.z-50')).toBeNull();
  });

  it('deve renderizar TEMPLATE com CONTEXTO corretamente', () => {
    const div = des[1];

    div.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();

    const tooltip = document.querySelector('.fixed.z-50');
    const span = tooltip?.querySelector('.template-content');

    expect(span).toBeTruthy();
    expect(span?.textContent).toBe('Olá, Vinicius');
  });

  it('deve remover o tooltip do DOM se o componente for destruído', () => {
    const btn = des[0];
    btn.triggerEventHandler('mouseenter', null);
    fixture.detectChanges();

    expect(document.querySelector('.fixed.z-50')).toBeTruthy();

    fixture.destroy();

    expect(document.querySelector('.fixed.z-50')).toBeNull();
  });
});