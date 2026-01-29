import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
           (click)="cancel.emit()">

          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all scale-100 overflow-hidden"
               (click)="$event.stopPropagation()">

              <div class="p-6 text-center">
                  <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4 animate-bounce-short">
                      <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                  </div>

                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h3>

                  <div class="text-sm text-gray-500 leading-relaxed">
                      <ng-content></ng-content>
                  </div>
              </div>

              <div class="bg-gray-50 px-6 py-4 flex gap-3 flex-col sm:flex-row-reverse">
                  <button type="button" (click)="confirm.emit()"
                          class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-colors">
                      Confirmar Remoção
                  </button>

                  <button type="button" (click)="cancel.emit()"
                          class="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm transition-colors">
                      Cancelar
                  </button>
              </div>
          </div>
      </div>
  `,
  styles: [`
    @keyframes bounce-short {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10%); }
    }
    .animate-bounce-short {
      animation: bounce-short 0.5s ease-in-out 1;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() title: string = 'Confirmação';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}