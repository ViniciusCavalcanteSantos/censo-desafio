<?php

namespace App\Repository;

use Illuminate\Support\Facades\DB;

class InstituicaoUsuarioRepository
{
    private static function montarClausulasWhere($inst_codigo, $filtros)
    {
        $where = " WHERE " . config('database.censo_schema')  . ".instituicao_usuarios.deleted_at IS NULL
                   AND " . config('database.censo_schema')  . ".usuario_perfil.deleted_at IS NULL
                   AND " . config('database.censo_schema')  . ".instituicao_perfil.deleted_at IS NULL
                   AND " . config('database.censo_schema')  . ".instituicao_usuarios.inst_codigo = :inst_codigo ";

        $bindings = ['inst_codigo' => $inst_codigo];

        if (!empty($filtros['search'])) {
            $where .= " AND (" . config('database.compartilhados_schema')  . ".id_usuarios.usua_nome LIKE :search 
                        OR " . config('database.compartilhados_schema')  . ".id_usuarios.usua_email LIKE :search) ";
            $bindings['search'] = '%' . $filtros['search'] . '%';
        }

        if (!empty($filtros['perfil'])) {
            $where .= " AND " . config('database.censo_schema')  . ".instituicao_perfil.perf_descricao = :perfil ";
            $bindings['perfil'] = $filtros['perfil'];
        }

        if (!empty($filtros['status'])) {
            if ($filtros['status'] === 'ativo') {
                $where .= " AND " . config('database.email_schema')  . ".em_black_list.black_list_id IS NULL ";
            } elseif (in_array($filtros['status'], ['bloqueado', 'bloqueado_penalidade', 'bloqueado_liberado'])) {
                $where .= " AND " . config('database.email_schema')  . ".em_black_list.black_list_id IS NOT NULL ";
            }
        }

        return [$where, $bindings];
    }

    public static function listar($inst_codigo, $limitSql, $filtros = [])
    {
        $horasLimite = config('constants.HORAS_MINIMAS_BLACKLIST', 24);
        list($whereSql, $bindings) = self::montarClausulasWhere($inst_codigo, $filtros);

        $sql = "SELECT
                " . config('database.censo_schema')  . ".instituicao_usuarios.inst_usua_id,
                " . config('database.censo_schema')  . ".instituicao_usuarios.inst_usua_codigo,
                " . config('database.compartilhados_schema')  . ".id_usuarios.usua_nome,
                " . config('database.compartilhados_schema')  . ".id_usuarios.usua_email,
                GROUP_CONCAT(DISTINCT " . config('database.censo_schema')  . ".instituicao_perfil.perf_descricao SEPARATOR ', ') AS usuario_perfil,
                
                MAX(IF(" . config('database.email_schema')  . ".em_black_list.black_list_id IS NULL, 0, 1)) AS is_blacklisted,
                
                MAX(DATE_ADD(" . config('database.email_schema')  . ".em_black_list.black_list_data_inclusao, INTERVAL $horasLimite HOUR)) AS blacklist_deadline,

                MAX(CASE 
                    WHEN " . config('database.email_schema')  . ".em_black_list.black_list_id IS NULL THEN 0
                    WHEN TIMESTAMPDIFF(HOUR, " . config('database.email_schema')  . ".em_black_list.black_list_data_inclusao, NOW()) >= $horasLimite THEN 1
                    ELSE 0
                END) AS can_be_removed

            FROM " . config('database.censo_schema')  . ".instituicao_usuarios
            INNER JOIN " . config('database.compartilhados_schema')  . ".id_usuarios ON " . config('database.censo_schema')  . ".instituicao_usuarios.usua_id = " . config('database.compartilhados_schema')  . ".id_usuarios.usua_id
            INNER JOIN " . config('database.censo_schema')  . ".usuario_perfil ON " . config('database.censo_schema')  . ".instituicao_usuarios.inst_usua_id = " . config('database.censo_schema')  . ".usuario_perfil.inst_usua_id
            INNER JOIN " . config('database.censo_schema')  . ".instituicao_perfil ON " . config('database.censo_schema')  . ".usuario_perfil.perf_id = " . config('database.censo_schema')  . ".instituicao_perfil.perf_id
            LEFT JOIN " . config('database.email_schema')  . ".em_black_list ON " . config('database.email_schema')  . ".em_black_list.black_list_mail = " . config('database.compartilhados_schema')  . ".id_usuarios.usua_email
            
            $whereSql
                
            GROUP BY " . config('database.censo_schema')  . ".instituicao_usuarios.inst_usua_id
            
            -- HAVING para filtros calculados (Penalidade vs Liberado)
            HAVING 1=1 
            " . ($filtros['status'] === 'bloqueado_penalidade' ? " AND can_be_removed = 0 " : "") . "
            " . ($filtros['status'] === 'bloqueado_liberado' ? " AND can_be_removed = 1 " : "") . "

            ORDER BY " . config('database.compartilhados_schema')  . ".id_usuarios.usua_nome
            $limitSql";

        return DB::select($sql, $bindings);
    }

    public static function contar($inst_codigo, $filtros = [])
    {
        list($whereSql, $bindings) = self::montarClausulasWhere($inst_codigo, $filtros);

        $sql = "SELECT COUNT(DISTINCT " . config('database.censo_schema')  . ".instituicao_usuarios.inst_usua_id) as total
            FROM " . config('database.censo_schema')  . ".instituicao_usuarios
            INNER JOIN " . config('database.compartilhados_schema')  . ".id_usuarios ON " . config('database.censo_schema')  . ".instituicao_usuarios.usua_id = " . config('database.compartilhados_schema')  . ".id_usuarios.usua_id
            INNER JOIN " . config('database.censo_schema')  . ".usuario_perfil ON " . config('database.censo_schema')  . ".instituicao_usuarios.inst_usua_id = " . config('database.censo_schema')  . ".usuario_perfil.inst_usua_id
            INNER JOIN " . config('database.censo_schema')  . ".instituicao_perfil ON " . config('database.censo_schema')  . ".usuario_perfil.perf_id = " . config('database.censo_schema')  . ".instituicao_perfil.perf_id
            LEFT JOIN " . config('database.email_schema')  . ".em_black_list ON " . config('database.email_schema')  . ".em_black_list.black_list_mail = " . config('database.compartilhados_schema')  . ".id_usuarios.usua_email
            $whereSql";

        $result = DB::selectOne($sql, $bindings);
        return $result ? $result->total : 0;
    }
}