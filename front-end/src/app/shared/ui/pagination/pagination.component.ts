import { Component, EventEmitter, Input, Output, computed, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (totalPages() > 1) {
      <div class="flex items-center gap-2 select-none">
        
        <button 
          (click)="changePage(currentPage() - 1)"
          [disabled]="currentPage() === 1"
          class="flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>

        @for (page of visiblePages(); track $index) {
          @if (page === -1) {
            <span class="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
          } @else {
            <button 
              (click)="changePage(page)"
              [class.bg-blue-600]="currentPage() === page"
              [class.text-white]="currentPage() === page"
              [class.border-blue-600]="currentPage() === page"
              [class.bg-white]="currentPage() !== page"
              [class.text-gray-600]="currentPage() !== page"
              [class.hover:bg-gray-50]="currentPage() !== page"
              class="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-sm font-medium transition-all">
              {{ page }}
            </button>
          }
        }

        <button 
          (click)="changePage(currentPage() + 1)"
          [disabled]="currentPage() === totalPages()"
          class="flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    }
  `
})
export class PaginationComponent {
  @Input({ required: true }) set current(val: number) { this.currentPage.set(val); }
  @Input({ required: true }) set total(val: number) { this.totalItems.set(val); }
  @Input() set size(val: number) { this.pageSize.set(val); }

  @Output() pageChange = new EventEmitter<number>();

  currentPage = signal(1);
  totalItems = signal(0);
  pageSize = signal(10);

  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 1; // Quantas páginas mostrar ao redor da atual
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number | undefined;

    // 1. Gera o range bruto (ex: 1, 20, e os vizinhos do atual)
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    // 2. Adiciona os "..." (-1 representa reticências) onde houver buracos
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1); // -1 será renderizado como "..."
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  });

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}