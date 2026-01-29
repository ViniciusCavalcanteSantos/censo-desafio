import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CountdownComponent } from './countdown.component';
import { vi } from 'vitest';

describe('CountdownComponent', () => {
  let component: CountdownComponent;
  let fixture: ComponentFixture<CountdownComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [CountdownComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CountdownComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve criar o componente', () => {
    component.deadline = new Date().toISOString();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve iniciar com o texto "Calculando..."', () => {
    expect(component.timeLeft()).toBe('Calculando...');
  });

  it('deve formatar o tempo corretamente (HH:mm:ss)', () => {
    const baseTime = new Date('2024-01-01T12:00:00').getTime();

    vi.setSystemTime(baseTime);

    // Deadline: 1h 30m 05s no futuro
    const targetDate = new Date(baseTime + (5405 * 1000));
    component.deadline = targetDate.toISOString();

    fixture.detectChanges(); // Renderiza inicial

    expect(component.timeLeft()).toBe('01:30:05');

    // Avança o tempo em 1 segundo
    vi.advanceTimersByTime(1000);

    fixture.detectChanges();

    expect(component.timeLeft()).toBe('01:30:04');
  });

  it('deve exibir "Liberado!" quando o tempo acabar', () => {
    const baseTime = new Date('2024-01-01T10:00:00').getTime();
    vi.setSystemTime(baseTime);

    // Deadline: 5 segundos
    const targetDate = new Date(baseTime + 5000);
    component.deadline = targetDate.toISOString();
    fixture.detectChanges();

    expect(component.timeLeft()).toBe('00:00:05');

    vi.advanceTimersByTime(5000);
    fixture.detectChanges();

    expect(component.timeLeft()).toBe('00:00:00');

    // Avança +1 segundo (Passou do tempo)
    vi.advanceTimersByTime(1000);
    fixture.detectChanges();

    expect(component.timeLeft()).toBe('Liberado!');
  });
});