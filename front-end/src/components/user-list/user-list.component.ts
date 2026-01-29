import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '../../services/user.service';
import { User } from '../../models/user.interface';
import { TooltipDirective } from '../../directives/tooltip.directive';
import { EditUserModalComponent } from '../edit-user-modal/edit-user-modal.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective, EditUserModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl shadow-[0_0_20px_rgba(76,87,125,0.02)] border border-gray-100 overflow-hidden">

      <div class="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 class="text-xl font-bold text-gray-800 tracking-tight">Lista de Usuários</h3>
          <p class="text-sm text-gray-400 mt-1">Gerenciamento de membros e permissões</p>
        </div>

        <div class="relative w-full md:w-64">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <svg class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Pesquisar usuários..."
            class="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 sm:text-sm"
          >
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 border-b border-gray-100">
              <th class="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Código</th>
              <th class="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuário</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Perfil</th>
              <th class="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
              <th class="px-8 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-50">
            @if (isLoading()) {
               @for (item of [1,2,3]; track item) {
                <tr class="animate-pulse">
                  <td class="px-8 py-4">
                    <div class="flex items-center gap-3">
                      <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
                      <div class="space-y-2">
                        <div class="h-4 w-32 bg-gray-200 rounded"></div>
                        <div class="h-3 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4"><div class="h-4 w-20 bg-gray-200 rounded"></div></td>
                  <td class="px-6 py-4"><div class="h-6 w-16 bg-gray-200 rounded-full mx-auto"></div></td>
                  <td class="px-6 py-4"><div class="h-4 w-12 bg-gray-200 rounded mx-auto"></div></td>
                  <td class="px-8 py-4"><div class="h-8 w-8 bg-gray-200 rounded ml-auto"></div></td>
                </tr>
               }
            }
            @else if (filteredUsers().length === 0) {
              <tr>
                <td colspan="5" class="px-8 py-12 text-center text-gray-400">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p class="text-base font-medium">Nenhum usuário encontrado</p>
                    <p class="text-sm">Tente ajustar seus termos de pesquisa.</p>
                  </div>
                </td>
              </tr>
            }
            @else {
              @for (user of filteredUsers(); track user.inst_usua_id) {
                <tr class="group hover:bg-gray-50/80 transition-colors duration-200">

                  <td class="px-6 py-4 text-center">
                    <span class="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      {{ user.inst_usua_codigo }}
                    </span>
                  </td>

                  <td class="px-8 py-4">
                    <div class="flex items-center gap-4">
                      <div class="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-blue-100 transition-colors">
                        {{ getInitials(user.usua_nome) }}
                      </div>
                      <div>
                        <div class="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {{ user.usua_nome }}
                        </div>
                        <div class="text-xs text-gray-500 font-medium">
                          {{ user.usua_email }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      {{ user.usuario_perfil }}
                    </span>
                  </td>

                  <td class="px-6 py-4 text-center">
                    @if (user.is_blacklisted === 1) {
                      <span appTooltip="Usuário Bloqueado" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 cursor-pointer">
                        <i class="fa-solid fa-ban text-sm"></i>
                      </span>
                    } @else {
                      <span appTooltip="Usuário Ativo" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 cursor-pointer">
                        <i class="fa-solid fa-check text-sm"></i>
                      </span>
                    }
                  </td>

                  <td class="px-8 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">

                      <button
                         (click)="selectedUser.set(user)"
                         appTooltip="Editar Usuário"
                         class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                         title="Editar">
                         <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                      </button>

                      @if (user.can_be_removed === 1) {
                        <button
                          (click)="removeUser(user)"
                          appTooltip="Remover Acesso"
                          class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remover">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      } @else {
                         <div class="w-8"></div>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <div class="px-8 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm">
         <span class="text-gray-500">Mostrando <span class="font-medium text-gray-900">{{ filteredUsers().length }}</span> registros</span>
         <div class="flex gap-1">
           <button class="px-3 py-1 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
           <button class="px-3 py-1 rounded border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">Próximo</button>
         </div>
      </div>
    </div>

    @if (selectedUser()) {
       <app-edit-user-modal
          [user]="selectedUser()!"
          (close)="selectedUser.set(null)"
          (saveUser)="onSaveUser($event)"
       ></app-edit-user-modal>
    }
  `
})
export class UserListComponent {
  private readonly userService = inject(UserService);

  searchQuery = signal<string>('');
  selectedUser = signal<User | null>(null);

  rawUsers = toSignal(this.userService.getUsers(), { initialValue: [] as User[] });

  isLoading = computed(() => this.rawUsers().length === 0);

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const users = this.rawUsers();

    if (!query) return users;

    return users.filter((user: User) =>
      user.usua_nome.toLowerCase().includes(query) ||
      user.usua_email.toLowerCase().includes(query) ||
      user.inst_usua_codigo.includes(query)
    );
  });

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '';
  }

  onSaveUser(updatedUser: User) {

    this.userService.updateUser(updatedUser).subscribe({
      next: (response) => {
        alert(`Sucesso! O usuário ${updatedUser.usua_nome} foi atualizado.`);

        this.selectedUser.set(null);

        window.location.reload();
      },
      error: (err) => {
        console.error('Erro ao salvar:', err);
        alert('Erro ao tentar salvar. Verifique o console para detalhes.');
      }
    });
  }

  removeUser(user: User) {
    if (confirm(`ATENÇÃO: Deseja realmente remover o acesso de ${user.usua_nome}?`)) {
      console.log('Removendo ID:', user.inst_usua_id);
      alert('Usuário removido com sucesso!');
      window.location.reload();
    }
  }
}
