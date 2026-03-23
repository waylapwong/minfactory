import { Component, ElementRef, HostListener, InputSignal, WritableSignal, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

export interface SelectOption {
  disabled?: boolean;
  imageSrc?: string;
  label: string;
  value: string;
}

@Component({
  selector: 'min-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  imports: [ReactiveFormsModule],
})
export class SelectComponent {
  public formControlInput: InputSignal<FormControl> = input.required();
  public id: InputSignal<string> = input.required();
  public label: InputSignal<string> = input('');
  public options: InputSignal<readonly SelectOption[]> = input.required();
  public placeholder: InputSignal<string> = input('');
  public readonly isOpen: WritableSignal<boolean> = signal(false);

  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

  public get selectedOption(): SelectOption | null {
    const value: string = this.formControlInput().value;
    const option: SelectOption | undefined = this.options().find((currentOption) => currentOption.value === value);
    return option ?? null;
  }

  public isFormControlInvalid(): boolean {
    return this.formControlInput().invalid && (this.formControlInput().touched || this.formControlInput().dirty);
  }

  public closeDropdown(): void {
    this.isOpen.set(false);
  }

  public getOptionAriaLabel(option: SelectOption): string {
    return option.label || option.value;
  }

  public onToggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
  }

  public selectOption(option: SelectOption): void {
    if (option.disabled) {
      return;
    }

    this.formControlInput().setValue(option.value);
    this.formControlInput().markAsDirty();
    this.formControlInput().markAsTouched();
    this.closeDropdown();
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

    this.closeDropdown();
  }

  @HostListener('document:keydown.escape')
  public onEscapeKey(): void {
    this.closeDropdown();
  }
}
