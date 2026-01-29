import { Directive, ElementRef, HostListener, Input, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipTitle: string = '';
  tooltip: HTMLElement | null = null;
  offset = 10;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltip) { this.show(); }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.tooltip) { this.hide(); }
  }

  show() {
    this.tooltip = this.renderer.createElement('span');
    this.renderer.appendChild(
      this.tooltip,
      this.renderer.createText(this.tooltipTitle)
    );

    const classes = [
        'absolute', 'z-50', 'px-2', 'py-1',
        'text-xs', 'font-medium', 'text-white',
        'bg-gray-800', 'rounded', 'shadow-lg',
        'whitespace-nowrap', 'pointer-events-none',
        'transform', 'transition-opacity', 'duration-200', 'opacity-0'
    ];
    classes.forEach(c => this.renderer.addClass(this.tooltip, c));

    this.renderer.appendChild(document.body, this.tooltip);

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltip!.getBoundingClientRect();

    const top = hostPos.top - tooltipPos.height - this.offset;
    const left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

    this.renderer.setStyle(this.tooltip, 'top', `${top + window.scrollY}px`);
    this.renderer.setStyle(this.tooltip, 'left', `${left + window.scrollX}px`);


    setTimeout(() => {
        if (this.tooltip) this.renderer.removeClass(this.tooltip, 'opacity-0');
    }, 10);
  }

  hide() {
    if (this.tooltip) {
      this.renderer.addClass(this.tooltip, 'opacity-0');
      setTimeout(() => {
        if (this.tooltip) {
            this.renderer.removeChild(document.body, this.tooltip);
            this.tooltip = null;
        }
      }, 200);
    }
  }

  ngOnDestroy() {
    this.hide();
  }
}
