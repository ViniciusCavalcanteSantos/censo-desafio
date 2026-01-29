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

        // 1. Filtro de Pesquisa (CORREÇÃO AQUI)
        // O PDO não gosta de repetir :search, então criamos :search_nome e :search_email
        if (!empty($filtros['search'])) {
            $term = '%' . $filtros['search'] . '%';

            $where .= " AND (" . config('database.compartilhados_schema')  . ".id_usuarios.usua_nome LIKE :search_nome 
                        OR " . config('database.compartilhados_schema')  . ".id_usuarios.usua_email LIKE :search_email) ";

            $bindings['search_nome'] = $term;
            $bindings['search_email'] = $term;
        }

        // 2. Filtro de Perfil
        if (!empty($filtros['perfil'])) {
            $where .= " AND " . config('database.censo_schema')  . ".instituicao_perfil.perf_descricao = :perfil ";
            $bindings['perfil'] = $filtros['perfil'];
        }

        // 3. Filtro de Status
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
                " . config('database.compartilhados_schema')  . ".id_usuarios.usua_cpf,
                " . config('database.compartilhados_schema')  . ".id_usuarios.usua_sexo,
                " . config('database.compartilhados_schema')  . ".id_usuarios.usua_foto,
                " . config('database.compartilhados_schema')  . ".id_usuarios.usua_foto_miniatura,
                " . config('database.compartilhados_schema')  . ".id_usuarios.usua_data_nascimento,
                
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


    public static function salvar($dados)
    {
        // 1. Busca vínculo
        $instUsuario = DB::table(config('database.censo_schema') . '.instituicao_usuarios')
            ->where('inst_usua_id', $dados['inst_usua_id'])
            ->first();

        if (!$instUsuario) throw new \Exception("Usuário não encontrado.");

        // 2. Atualiza Tabela de Vínculo (Código)
        DB::table(config('database.censo_schema') . '.instituicao_usuarios')
            ->where('inst_usua_id', $dados['inst_usua_id'])
            ->update([
                'inst_usua_codigo' => $dados['usuario_codigo'], // Atualiza Matrícula/Código
                // 'updated_at' => date('Y-m-d H:i:s')
            ]);

        // 3. Atualiza Tabela de Dados Pessoais (Nome, Email, CPF, Sexo, Data Nasc, Fotos)
        $updateData = [
            'usua_nome' => $dados['usuario_nome'],
            'usua_email' => $dados['usuario_email'],
            'usua_cpf'   => $dados['usuario_cpf'] ?? null, // Garante que a coluna existe no banco
            'usua_sexo'  => $dados['usuario_sexo'] ?? null,
            'usua_data_nascimento' => $dados['data_nascimento'] ?? null,
        ];

        // Só atualiza fotos se elas foram enviadas (para não apagar a existente se o user não trocou)
        if (isset($dados['usua_foto'])) {
            $updateData['usua_foto'] = $dados['usua_foto'];
            $updateData['usua_foto_miniatura'] = $dados['usua_foto_miniatura'];
        }

        DB::table(config('database.compartilhados_schema') . '.id_usuarios')
            ->where('usua_id', $instUsuario->usua_id)
            ->update($updateData);

        // 4. Atualiza Perfil (Função)
        if (isset($dados['usuario_funcao'])) {
            $perfId = ($dados['usuario_funcao'] == 'Professor') ? 2 : 1;
            DB::table(config('database.censo_schema') . '.usuario_perfil')
                ->where('inst_usua_id', $dados['inst_usua_id'])
                ->update(['perf_id' => $perfId]);
        }

        return true;
    }

    public static function verificarEmailDuplicado($email, $instUsuaIdIgnorar = null)
    {
        $schemaCompartilhado = config('database.compartilhados_schema');
        $schemaCenso = config('database.censo_schema');

        // Query base: procura o email na tabela de usuários
        $query = DB::table($schemaCompartilhado . '.id_usuarios')
            ->join($schemaCenso . '.instituicao_usuarios', $schemaCompartilhado . '.id_usuarios.usua_id', '=', $schemaCenso . '.instituicao_usuarios.usua_id')
            ->where($schemaCompartilhado . '.id_usuarios.usua_email', $email)
            ->where($schemaCenso . '.instituicao_usuarios.deleted_at', null);

        // Se for edição, ignora o próprio usuário atual
        if ($instUsuaIdIgnorar) {
            $query->where($schemaCenso . '.instituicao_usuarios.inst_usua_id', '!=', $instUsuaIdIgnorar);
        }

        return $query->exists();
    }
}