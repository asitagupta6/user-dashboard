import {
  Component,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  @Output() userAdded = new EventEmitter<Omit<User, 'id' | 'createdAt'>>();
  @Output() modalClosed = new EventEmitter<void>();

  userForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.userForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    // Simulate brief async operation for UX
    setTimeout(() => {
      const { name, email, role } = this.userForm.value;
      this.userAdded.emit({ name: name.trim(), email: email.trim(), role: role as UserRole });
      this.isSubmitting = false;
      this.closeModal();
    }, 400);
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }
}
