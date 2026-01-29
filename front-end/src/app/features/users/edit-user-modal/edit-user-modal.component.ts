import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ConfirmModalComponent} from "../../../shared/ui/modals/confirm-modal/confirm-modal.component";
import {TooltipDirective} from "../../../shared/directives/tooltip.directive";
import {CountdownComponent} from "../../../shared/ui/countdown/countdown.component";
import {UserService} from "../../../core/services/user.service";
import {ToastService} from "../../../shared/ui/toast/toast.service";
import {User} from "../../../core/models/user.interface";

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, TooltipDirective, CountdownComponent],
  templateUrl: './edit-user-modal.component.html'
})
export class EditUserModalComponent {
  private userService = inject(UserService);
  private toast = inject(ToastService);

  @Input({ required: true }) set user(value: User) { this.editableUser = { ...value }; }
  @Output() close = new EventEmitter<void>();
  @Output() saveUser = new EventEmitter<User>();
  @Output() userUpdated = new EventEmitter<void>();

  editableUser!: User;
  showConfirm = signal(false);

  save() {
    this.saveUser.emit(this.editableUser);
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