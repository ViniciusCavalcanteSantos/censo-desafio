import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ConfirmModalComponent} from "../../../shared/ui/modals/confirm-modal/confirm-modal.component";
import {TooltipDirective} from "../../../shared/directives/tooltip.directive";
import {CountdownComponent} from "../../../shared/ui/countdown/countdown.component";
import {UserService} from "../../../core/services/user.service";
import {ToastService} from "../../../shared/ui/toast/toast.service";
import {User} from "../../../core/models/user.interface";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, TooltipDirective, CountdownComponent],
  templateUrl: './edit-user-modal.component.html'
})
export class EditUserModalComponent {
  private userService = inject(UserService);
  private toast = inject(ToastService);

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  @Input({ required: true }) set user(value: User) { this.editableUser = { ...value }; }
  @Output() close = new EventEmitter<void>();
  @Output() saveUser = new EventEmitter<any>();
  @Output() userUpdated = new EventEmitter<void>();

  editableUser!: User;
  showConfirm = signal(false);

  resolveImageUrl(path: string | undefined | null): string {
    if (!path) return '';

    if (path.startsWith('http') || path.startsWith('data:')) {
      return path;
    }

    const baseUrl = environment.apiUrl.endsWith('/') ? environment.apiUrl.slice(0, -1) : environment.apiUrl;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `${baseUrl}/${cleanPath}`;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  save() {
    this.userService.updateUser(this.editableUser, this.selectedFile).subscribe({
      next: (res) => {
        this.toast.show('Usuário salvo com sucesso!', 'success');
        this.userUpdated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Erro ao salvar', 'error');
      }
    });
  }

  handleBlacklistClick() {
    if (this.editableUser.can_be_removed === 1) {
      this.showConfirm.set(true);
    }
  }

  executeRemoval() {
    this.userService.removeFromBlacklist(this.editableUser.usua_email).subscribe({
      next: () => {
        this.showConfirm.set(false);
        this.editableUser.is_blacklisted = 0;
        this.toast.show('Usuário liberado com sucesso!', 'success')
      },
      error: (err) => this.toast.show(err.error?.message || 'Erro ao remover', 'success')
    });
  }
}