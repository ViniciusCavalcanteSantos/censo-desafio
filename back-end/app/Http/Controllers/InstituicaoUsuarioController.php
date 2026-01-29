<?php

/**
 * Created by PhpStorm.
 * User: Diogenes
 * Date: 03/11/2017
 * Time: 10:41
 */

namespace App\Http\Controllers;

use App\Model\InstituicaoUsuarios;
use App\Repository\InstituicaoUsuarioRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class InstituicaoUsuarioController extends Controller
{

    public function byId(Request $request)
    {
        try {
            $usuario = InstituicaoUsuarios::where('inst_usua_id', '=', $request->input('inst_usua_id'))
                ->first();
            $dados_usuario = $usuario->idUsuario;
            $usuario_perfil = $usuario->usuarioPerfis;

            $usuario_retorno = array();
            $usuario_retorno['inst_usua_id'] = $request->input('inst_usua_id');
            $usuario_retorno['usua_id'] = strval($dados_usuario->usua_id);
            $usuario_retorno['usuario_nome'] = $dados_usuario->usua_nome;
            $usuario_retorno['usuario_email'] = $dados_usuario->usua_email;
            $usuario_retorno['usuario_codigo'] = $usuario->inst_usua_codigo;
            $usuario_retorno['usuario_cpf'] = $dados_usuario->usua_cpf;
            $usuario_retorno['usuario_funcao'] = $usuario->inst_usua_funcao;
            $usuario_retorno['usuario_sexo'] = $dados_usuario->usua_sexo;
            $usuario_retorno['usuario_idioma'] = $usuario->inst_usua_idioma;
            $usuario_retorno['email_blacklist'] = (!empty($dados_usuario->usua_email) && !empty($dados_usuario->emBlackList) ? 1 : 0);
            $usuario_retorno['usua_foto'] = $dados_usuario['usua_foto'];
            $usuario_retorno['usua_foto_miniatura'] = $dados_usuario['usua_foto_miniatura'];

            if (!empty($dados_usuario->usua_data_nascimento) && $this->validar_data($dados_usuario->usua_data_nascimento)) {
                $data_nascimento = date_create($dados_usuario->usua_data_nascimento);
                $usuario_retorno['data_nascimento'] = $data_nascimento->format('d/m/Y');
            } else {
                $usuario_retorno['data_nascimento'] = '';
            }
            $usuario_retorno['usuario_telefones'] = array();

            $usuario_retorno['usuario_perfil'] = array();
            foreach ($usuario_perfil as $perfil) {
                $instituicao_perfil = $perfil->instituicaoPerfil;
                $perfil_array = array();
                $perfil_array['perf_id'] = $perfil->perf_id;
                $perfil_array['perf_descricao'] = $instituicao_perfil->perf_descricao;
                $perfil_array['usua_tipo_id'] = $instituicao_perfil->usua_tipo_id;
                $usuario_retorno['usuario_perfil'][] = $perfil_array;
            }

            return new JsonResponse(['success' => true, 'data' => $usuario_retorno, 'message' => ''], Response::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'data' => '', 'message' => 'Ocorreu um erro no processamento da requisição'], Response::HTTP_BAD_REQUEST);
        }
    }

    public function listar(Request $request)
    {
        try {
            $inst_codigo = $request->header('inst_codigo', 1);

            // Filtros
            $filtros = [
                'search' => $request->input('search'),
                'perfil' => $request->input('perfil'),
                'status' => $request->input('status')
            ];

            $perPage = 100;
            if ($request->has('limit')) {
                $perPage = min((int)$request->input('limit'), 100);
            } elseif ($request->has('offset')) {
                $perPage = config('constants.SEGUNDO_LIMIT', 50);
            }

            $page = (int) $request->input('page', 1);
            $offset = ($page - 1) * $perPage;

            if (!$request->has('page') && $request->has('offset')) {
                $offset = (int)$request->input('offset');
            }

            $limitSql = " LIMIT $perPage OFFSET $offset";

            $usuarios = InstituicaoUsuarioRepository::listar($inst_codigo, $limitSql, $filtros);
            $total = InstituicaoUsuarioRepository::contar($inst_codigo, $filtros);

            return response()->json([
                'success' => true,
                'data' => $usuarios,
                'meta' => [
                    'total' => (int) $total,
                    'page' => $page,
                    'last_page' => ceil($total / ($perPage > 0 ? $perPage : 1)),
                    'per_page' => $perPage
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    private function validar_data($dat)
    {
        $data = explode("-", "$dat");
        $d = $data[2];
        $m = $data[1];
        $y = $data[0];

        $res = checkdate($m, $d, $y);
        if ($res == 1) {
            return true;
        } else {
            return false;
        }
    }

    public function salvar(Request $request)
    {
        try {
            // 1. Definição das Regras (Apenas Nome e Email obrigatórios)
            $rules = [
                'inst_usua_id'    => 'required|integer',
                'usuario_nome'    => 'required|string|max:255',
                'usuario_email'   => 'required|email|max:255',

                // Campos agora Opcionais (nullable)
                'usuario_codigo'  => 'nullable|string|max:50',
                'usuario_cpf'     => 'nullable|digits:11', // Se vier, tem que ser 11 dígitos
                'usuario_funcao'  => 'nullable|string',

                // Sexo restrito a M ou F
                'usuario_sexo'    => 'nullable|in:M,F',

                'data_nascimento' => 'nullable|date_format:Y-m-d',
                'usua_foto'       => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
            ];

            // 2. Mensagens de Erro Customizadas (Pt-BR)
            $messages = [
                'required'    => 'O campo :attribute é obrigatório.',
                'email'       => 'O campo :attribute deve conter um endereço de e-mail válido.',
                'max'         => 'O campo :attribute não pode ter mais que :max caracteres.',
                'digits'      => 'O campo :attribute deve conter exatamente :digits dígitos.',
                'in'          => 'O valor selecionado para :attribute é inválido (apenas M ou F).',
                'date_format' => 'O campo :attribute não corresponde ao formato data (AAAA-MM-DD).',
                'image'       => 'O arquivo enviado para :attribute deve ser uma imagem.',
                'mimes'       => 'A imagem deve ser do tipo: jpeg, png ou jpg.',
                'integer'     => 'O campo :attribute deve ser um número inteiro.',
            ];

            // 3. Apelidos para os campos (Para não aparecer "usuario_nome" na mensagem)
            $customAttributes = [
                'usuario_nome'    => 'Nome',
                'usuario_email'   => 'E-mail',
                'usuario_codigo'  => 'Matrícula/Código',
                'usuario_cpf'     => 'CPF',
                'usuario_funcao'  => 'Função/Perfil',
                'usuario_sexo'    => 'Sexo',
                'data_nascimento' => 'Data de Nascimento',
                'usua_foto'       => 'Foto'
            ];

            // Executa Validação
            $validator = Validator::make($request->all(), $rules, $messages, $customAttributes);

            if ($validator->fails()) {
                return response()->json(['success' => false, 'message' => $validator->errors()->first()], 422);
            }

            // 4. Verificação de Duplicidade (E-mail)
            if (InstituicaoUsuarioRepository::verificarEmailDuplicado($request->input('usuario_email'), $request->input('inst_usua_id'))) {
                return response()->json(['success' => false, 'message' => 'Este e-mail já está sendo utilizado por outro usuário.'], 409);
            }

            $dados = $request->except('usua_foto');

            // 5. Upload de Imagem (Mantido igual)
            if ($request->hasFile('usua_foto') && $request->file('usua_foto')->isValid()) {
                $file = $request->file('usua_foto');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $uploadPath = base_path('public/uploads/usuarios');

                if (!file_exists($uploadPath)) mkdir($uploadPath, 0777, true);

                $file->move($uploadPath, $filename);

                $dados['usua_foto'] = 'uploads/usuarios/' . $filename;
                $dados['usua_foto_miniatura'] = 'uploads/usuarios/thumb_' . $filename;

                $this->gerarMiniatura($uploadPath . '/' . $filename, $uploadPath . '/thumb_' . $filename, 150, 150);
            }

            InstituicaoUsuarioRepository::salvar($dados);

            return response()->json(['success' => true, 'message' => 'Usuário salvo com sucesso!'], 200);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()], 500);
        }
    }

    // Função Auxiliar para gerar Thumbnail sem libs externas pesadas
    private function gerarMiniatura($origem, $destino, $maxW, $maxH) {
        list($largura, $altura, $tipo) = getimagesize($origem);

        // Carrega imagem baseada no tipo
        switch ($tipo) {
            case IMAGETYPE_JPEG: $img = imagecreatefromjpeg($origem); break;
            case IMAGETYPE_PNG:  $img = imagecreatefrompng($origem); break;
            default: return false;
        }

        // Calcula proporção
        $ratio = $largura / $altura;
        if ($maxW / $maxH > $ratio) {
            $maxW = $maxH * $ratio;
        } else {
            $maxH = $maxW / $ratio;
        }

        // Cria nova imagem vazia
        $nova = imagecreatetruecolor($maxW, $maxH);

        // Preserva transparência se for PNG
        if ($tipo == IMAGETYPE_PNG) {
            imagealphablending($nova, false);
            imagesavealpha($nova, true);
        }

        // Redimensiona
        imagecopyresampled($nova, $img, 0, 0, 0, 0, $maxW, $maxH, $largura, $altura);

        // Salva
        if ($tipo == IMAGETYPE_JPEG) imagejpeg($nova, $destino, 80); // Qualidade 80
        if ($tipo == IMAGETYPE_PNG)  imagepng($nova, $destino);

        imagedestroy($img);
        imagedestroy($nova);
        return true;
    }

    public function removerBlacklist(Request $request) {
        try {
            $email = $request->input('email');
            $blacklist = \App\Model\BlackList::where('black_list_mail', $email)->first();

            if (!$blacklist) {
                return new JsonResponse(['success' => false, 'message' => 'E-mail não encontrado na blacklist.'], Response::HTTP_NOT_FOUND);
            }

            $dataInclusao = new \DateTime($blacklist->black_list_data_inclusao);
            $agora = new \DateTime();
            $diff = $agora->diff($dataInclusao);
            $horasPassadas = ($diff->days * 24) + $diff->h;

            $tempoMinimo = config('constants.HORAS_MINIMAS_BLACKLIST');

            if ($horasPassadas < $tempoMinimo) {
                $horasRestantes = $tempoMinimo - $horasPassadas;
                return new JsonResponse([
                    'success' => false,
                    'message' => "Aguarde {$horasRestantes} horas para remover este e-mail novamente."
                ], Response::HTTP_FORBIDDEN);
            }

            $blacklist->delete();

            return new JsonResponse(['success' => true, 'message' => 'E-mail removido com sucesso!'], Response::HTTP_OK);

        } catch (\Exception $e) {
            return new JsonResponse(['success' => false, 'message' => 'Erro ao processar solicitação.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
