import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.interface';

@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-[99] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">

      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">

        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-800">Editar Usuário</h3>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input type="text" [(ngModel)]="userData.usua_nome"
                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input type="email" [(ngModel)]="userData.usua_email"
                   class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-gray-50" readonly>
             <span class="text-xs text-gray-400">O e-mail não pode ser alterado.</span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
            <select [(ngModel)]="userData.usuario_perfil"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all bg-white">
              <option value="Administrador">Administrador</option>
              <option value="Professor">Professor</option>
              <option value="Diretor">Diretor</option>
            </select>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button (click)="close.emit()"
                  class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            Cancelar
          </button>
          <button (click)="save()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all">
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.3s ease-out forwards;
    }
  `]
})
export class EditUserModalComponent {
  @Input({ required: true }) set user(value: User) {
    this.userData = { ...value };
  }

  @Output() close = new EventEmitter<void>();
  @Output() saveUser = new EventEmitter<User>();

  userData!: User;

  save() {
    this.saveUser.emit(this.userData);
  }
}
