import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  OnDestroy,
  inject,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') content: string | TemplateRef<any> | null = '';

  @Input() tooltipContext: any = null;

  private tooltipElement: HTMLElement | null = null;
  private embeddedView: EmbeddedViewRef<any> | null = null;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private vcr = inject(ViewContainerRef);

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.tooltipElement && this.content) {
      this.show();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hide();
  }

  ngOnDestroy() {
    this.hide();
  }

  private show() {
    this.tooltipElement = this.renderer.createElement('div');
    this.styleTooltip(this.tooltipElement!);

    if (this.content instanceof TemplateRef) {
      this.embeddedView = this.vcr.createEmbeddedView(this.content, {$implicit: this.tooltipContext});
      this.embeddedView.detectChanges();

      this.embeddedView.rootNodes.forEach(node => {
        this.renderer.appendChild(this.tooltipElement, node);
      });

    } else {
      const text = this.renderer.createText(String(this.content));
      this.renderer.appendChild(this.tooltipElement, text);
    }

    this.renderer.appendChild(document.body, this.tooltipElement);
    this.positionTooltip();
  }

  private hide() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
    if (this.embeddedView) {
      this.embeddedView.destroy();
      this.embeddedView = null;
    }
  }

  private positionTooltip() {
    if (!this.tooltipElement) return;
    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const top = hostPos.bottom + 8;
    const left = hostPos.left + (hostPos.width / 2);

    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipElement, 'transform', 'translateX(-50%)');
  }

  private styleTooltip(el: HTMLElement) {
    const classes = ['fixed', 'z-50', 'bg-gray-900', 'text-white', 'text-xs', 'px-3', 'py-2', 'rounded-lg', 'shadow-xl', 'pointer-events-none', 'border', 'border-gray-700'];
    classes.forEach(c => this.renderer.addClass(el, c));
  }
}