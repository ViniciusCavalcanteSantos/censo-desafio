export interface User {
  inst_usua_id: number;
  inst_usua_codigo: string;
  usua_nome: string;
  usua_email: string;
  usuario_perfil: string;
  is_blacklisted: number;
  can_be_removed: number;
  blacklist_deadline?: string;
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    last_page: number;
    per_page: number;
  };
}