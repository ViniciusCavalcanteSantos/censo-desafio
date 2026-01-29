import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto transform transition-all duration-300 ease-in-out animate-slide-in shadow-lg rounded-lg border-l-4 p-4 flex items-start justify-between bg-white backdrop-blur-sm bg-opacity-95"
          [ngClass]="getStyles(toast.type)">
          
          <div class="flex items-center gap-3">
            <span [ngClass]="getIconColor(toast.type)">
              @if(toast.type === 'success') { <i class="fa-solid fa-circle-check text-lg"></i> }
              @if(toast.type === 'error') { <i class="fa-solid fa-circle-exclamation text-lg"></i> }
              @if(toast.type === 'info') { <i class="fa-solid fa-circle-info text-lg"></i> }
              @if(toast.type === 'warning') { <i class="fa-solid fa-triangle-exclamation text-lg"></i> }
            </span>

            <p class="text-sm font-medium text-gray-800 leading-snug">
              {{ toast.message }}
            </p>
          </div>

          <button (click)="toastService.remove(toast.id)" class="text-gray-400 hover:text-gray-600 transition-colors ml-4">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  getStyles(type: ToastType): string {
    switch (type) {
      case 'success': return 'border-green-500 shadow-green-500/10';
      case 'error': return 'border-red-500 shadow-red-500/10';
      case 'warning': return 'border-amber-500 shadow-amber-500/10';
      case 'info': return 'border-blue-500 shadow-blue-500/10';
    }
  }

  getIconColor(type: ToastType): string {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      case 'info': return 'text-blue-500';
    }
  }
}