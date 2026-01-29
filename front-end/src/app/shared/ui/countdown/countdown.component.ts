import {Component, Input, OnDestroy, OnInit, signal, NgZone, inject, ChangeDetectionStrategy} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="font-mono font-bold text-red-300">{{ timeLeft() }}</span>`
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Input({required: true}) deadline!: string;

  timeLeft = signal<string>('Calculando...');
  private intervalId: any;
  private ngZone = inject(NgZone);
  private targetDate: number = 0;

  ngOnInit() {
    this.targetDate = new Date(this.deadline).getTime();
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private startTimer() {
    this.updateTime();
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.updateTime();
      }, 1000);
    });
  }

  private updateTime() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    if (distance < 0) {
      this.stopTimer();
      this.ngZone.run(() => this.timeLeft.set('Liberado!'));
      return;
    }

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const timeString = `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;

    this.ngZone.run(() => this.timeLeft.set(timeString));
  }

  private stopTimer() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private pad(n: number) {
    return n < 10 ? '0' + n : n;
  }
}