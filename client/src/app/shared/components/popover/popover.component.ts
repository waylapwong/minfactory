import { Component, ElementRef, HostListener, InputSignal, WritableSignal, inject, input, signal } from '@angular/core';

@Component({
  selector: 'min-popover',
  standalone: true,
  imports: [],
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent {
  private static nextPopoverId: number = 0;

  public content: InputSignal<string> = input('');
  public disabled: InputSignal<boolean> = input(false);
  public readonly isVisible: WritableSignal<boolean> = signal(false);
  public readonly isPinnedByClick: WritableSignal<boolean> = signal(false);
  public readonly popoverId: string = `min-popover-${PopoverComponent.nextPopoverId++}`;

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

  public onMouseEnter(): void {
    this.openPopover();
  }

  public onMouseLeave(): void {
    if (this.isPinnedByClick()) {
      return;
    }

    this.isVisible.set(false);
  }

  public onHostClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    event.stopPropagation();

    if (this.isPinnedByClick()) {
      this.isPinnedByClick.set(false);
      this.isVisible.set(false);
      return;
    }

    this.isPinnedByClick.set(true);
    this.isVisible.set(true);
  }

  public onFocusIn(): void {
    this.openPopover();
  }

  public onHostKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();

    this.onHostClick(new MouseEvent('click'));
  }

  public onFocusOut(event: FocusEvent): void {
    const nextTarget: EventTarget | null = event.relatedTarget;
    const hostElement: HTMLElement = this.elementRef.nativeElement;

    if (nextTarget instanceof Node && hostElement.contains(nextTarget)) {
      return;
    }

    if (this.isPinnedByClick()) {
      return;
    }

    this.isVisible.set(false);
  }

  @HostListener('document:click', ['$event'])
  public onDocumentClick(event: MouseEvent): void {
    const targetNode: EventTarget | null = event.target;

    if (!(targetNode instanceof Node)) {
      return;
    }

    if (this.elementRef.nativeElement.contains(targetNode)) {
      return;
    }

    this.closePopover();
  }

  @HostListener('document:keydown.escape')
  public onEscapeKey(): void {
    this.closePopover();
  }

  private closePopover(): void {
    this.isPinnedByClick.set(false);
    this.isVisible.set(false);
  }

  private openPopover(): void {
    if (this.disabled()) {
      return;
    }

    this.isVisible.set(true);
  }
}
