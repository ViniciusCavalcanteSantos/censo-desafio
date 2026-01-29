import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.interface';
import { UserService } from '../../services/user.service';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { CountdownComponent } from '../countdown/countdown.component';
import {ConfirmModalComponent} from "../modals/confirm-modal.component";
import {ToastService} from "../shared/ui/toast/toast.service";

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmModalComponent, TooltipDirective, CountdownComponent],
  template: `
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
           (click)="close.emit()">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
               (click)="$event.stopPropagation()">

              <div class="px-8 py-6 border-b border-gray-100 bg-white">
                  <div class="flex justify-between items-start">
                      <div class="space-y-1">
                          <h3 class="text-xl font-bold text-gray-900 tracking-tight">Editar Usuário</h3>

                          <div class="flex items-center gap-2 text-sm text-gray-500 font-medium">
                              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                              </svg>
                              {{ editableUser.usua_email }}
                          </div>
                      </div>

                      <button (click)="close.emit()"
                              class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-all">
                          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                      </button>
                  </div>
              </div>

              <div class="p-8 space-y-6">

                  <div class="space-y-1.5">
                      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nome Completo</label>
                      <input type="text" [(ngModel)]="editableUser.usua_nome"
                             class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-800 placeholder-gray-400 font-medium">
                  </div>

                  <div class="space-y-1.5">
                      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Perfil de
                          Acesso</label>
                      <div class="relative">
                          <select [(ngModel)]="editableUser.usuario_perfil"
                                  class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white text-gray-800 appearance-none font-medium cursor-pointer">
                              <option value="Administrador">Administrador</option>
                              <option value="Professor">Professor</option>
                          </select>

                          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7"/>
                              </svg>
                          </div>
                      </div>
                  </div>

                  @if (editableUser.is_blacklisted === 1) {
                      <div class="mt-6 pt-6 border-t border-dashed border-gray-200">
                          <div class="rounded-xl border border-red-100 bg-red-50 p-4 flex items-center justify-between group hover:border-red-200 transition-colors">
                              <div class="flex items-center gap-4">
                                  <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm border border-red-50">
                                      <i class="fa-solid fa-user-lock text-lg"></i>
                                  </div>
                                  <div>
                                      <p class="text-sm font-bold text-gray-900">Acesso Bloqueado</p>
                                      <p class="text-xs text-red-600 font-medium mt-0.5">Usuário está na blacklist</p>
                                  </div>
                              </div>

                              <ng-template #tipContent let-u>
                                  <div class="flex flex-col items-center p-1 gap-1">
                                      <span class="text-gray-200 font-medium">Liberação automática em:</span>
                                      <app-countdown [deadline]="editableUser.blacklist_deadline!"></app-countdown>
                                  </div>
                              </ng-template>

                              <button (click)="handleBlacklistClick()"
                                      [disabled]="editableUser.can_be_removed === 0"
                                      [appTooltip]="editableUser.can_be_removed === 0 ? tipContent : 'Liberar acesso agora'"
                                      [class.opacity-50]="editableUser.can_be_removed === 0"
                                      [class.grayscale]="editableUser.can_be_removed === 0"
                                      class="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-bold rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-md disabled:hover:shadow-none disabled:hover:bg-white disabled:hover:text-red-600 transition-all duration-200">
                                  Desbloquear
                              </button>
                          </div>
                      </div>
                  }
              </div>

              <div class="px-8 py-5 bg-gray-50/80 flex justify-end gap-3 border-t border-gray-100 backdrop-blur-sm">
                  <button (click)="close.emit()"
                          class="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors">
                      Cancelar
                  </button>
                  <button (click)="save()"
                          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-700/30 transform hover:-translate-y-0.5 transition-all duration-200">
                      Salvar Alterações
                  </button>
              </div>
          </div>
      </div>

      @if (showConfirm()) {
          <app-confirm-modal
                  [title]="'Remover da Blacklist?'"
                  (confirm)="executeRemoval()"
                  (cancel)="showConfirm.set(false)">

              <p>
                  Você está prestes a remover o usuário
                  <span class="font-bold text-indigo-600 text-base">
            {{ editableUser.usua_nome }}
          </span>
                  da lista de bloqueio. Esta ação permitirá que ele acesse o sistema imediatamente.
              </p>
          </app-confirm-modal>
      }
  `
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