import {Component, ChangeDetectionStrategy, inject, signal, computed, OnInit} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TooltipDirective} from "../../../shared/directives/tooltip.directive";
import {EditUserModalComponent} from "../edit-user-modal/edit-user-modal.component";
import {CountdownComponent} from "../../../shared/ui/countdown/countdown.component";
import {ConfirmModalComponent} from "../../../shared/ui/modals/confirm-modal/confirm-modal.component";
import {UserService} from "../../../core/services/user.service";
import {ToastService} from "../../../shared/ui/toast/toast.service";
import {User} from "../../../core/models/user.interface";
import {PaginationComponent} from "../../../shared/ui/pagination/pagination.component";
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TooltipDirective, EditUserModalComponent, CountdownComponent, ConfirmModalComponent, PaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private toast = inject(ToastService);

  // Signals de Filtro
  searchQuery = signal<string>('');
  selectedPerfil = signal('');
  selectedStatus = signal('todos');

  // Signals de Paginação
  currentPage = signal(1);
  pageSize = signal(7);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  selectedUser = signal<User | null>(null);

  showConfirmModal = signal<boolean>(false);
  userPendingRemoval = signal<User | null>(null);

  users = signal<User[]>([]);
  isLoading = signal<boolean>(true);

  private searchSubject = new Subject<string>();

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const users = this.users();
    if (!query) return users;

    return users.filter((user: User) =>
      user.usua_nome.toLowerCase().includes(query) ||
      user.usua_email.toLowerCase().includes(query) ||
      user.inst_usua_codigo.includes(query)
    );
  });

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchQuery.set(term);
      this.currentPage.set(1);
      this.refreshUsers();
    });

    this.refreshUsers();
  }

  onSearchInput(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.refreshUsers();
  }

  refreshUsers() {
    this.isLoading.set(true);

    this.userService.getUsers(
      this.currentPage(),
      this.pageSize(),
      this.searchQuery(),
      this.selectedPerfil(),
      this.selectedStatus()
    ).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalItems.set(response.meta.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toast.show('Erro ao carregar usuários. Tente novamente.', 'error');
        this.isLoading.set(false);
        this.users.set([]);
      }
    });
  }

  onPageChange(newPage: number) {
    this.currentPage.set(newPage);
    this.refreshUsers();
  }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '';
  }

  removeUser(user: User) {
    if (confirm(`ATENÇÃO: Deseja realmente remover o acesso de ${user.usua_nome}?`)) {
      this.toast.show(`Usuário removido com sucesso!`, 'success');
      window.location.reload();
    }
  }

  handleBlacklistAction(user: User) {
    if (user.is_blacklisted !== 1) return;

    if (user.can_be_removed === 0) {
      return;
    }

    this.userPendingRemoval.set(user);
    this.showConfirmModal.set(true);
  }

  onConfirmRemoval() {
    const user = this.userPendingRemoval();

    if (user) {
      this.userService.removeFromBlacklist(user.usua_email).subscribe({
        next: (response: any) => {
          this.closeModal();
          this.toast.show(`E-mail removido da blacklist com sucesso!`, 'success');
          this.refreshUsers();
        },
        error: (err) => {
          console.error(err);
          this.toast.show(`Erro ao remover e-mail da blacklist.`, 'error');
          this.closeModal();
        }
      });
    }
  }

  closeModal() {
    this.showConfirmModal.set(false);
    this.userPendingRemoval.set(null);
  }
}
