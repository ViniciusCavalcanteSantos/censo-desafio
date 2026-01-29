<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('email.em_black_list')->truncate();
        DB::table('censo.usuario_perfil')->truncate();
        DB::table('censo.instituicao_usuarios')->truncate();
        DB::table('compartilhados.id_usuarios')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $totalUsuarios = 60;
        $totalBlacklist = 50;
        $qtdPodeRemover = 30;

        $this->command->info("Iniciando a criação de {$totalUsuarios} usuários com perfis...");

        $usersEmails = [];

        for ($i = 0; $i < $totalUsuarios; $i++) {

            $isDiretor = rand(0, 1) === 1;
            $perfId = $isDiretor ? 1 : 2;
            $funcaoTexto = $isDiretor ? 'Diretor' : 'Professor';

            $usuario = factory(App\Model\IdUsuarios::class)->create();
            $usersEmails[] = $usuario->usua_email;

            $vinculo = factory(App\Model\InstituicaoUsuarios::class)->create([
                'usua_id' => $usuario->usua_id,
                'inst_usua_funcao' => $funcaoTexto
            ]);

            factory(App\Model\UsuarioPerfil::class)->create([
                'inst_usua_id' => $vinculo->inst_usua_id,
                'perf_id' => $perfId
            ]);
        }

        if (count($usersEmails) > 0) {
            $emailsSorteadosKeys = array_rand($usersEmails, $totalBlacklist);
            $emailsSorteados = [];

            if (!is_array($emailsSorteadosKeys)) $emailsSorteadosKeys = [$emailsSorteadosKeys];

            foreach ($emailsSorteadosKeys as $key) {
                $emailsSorteados[] = $usersEmails[$key];
            }

            $emailsLiberados = array_slice($emailsSorteados, 0, $qtdPodeRemover);
            $emailsBloqueados = array_slice($emailsSorteados, $qtdPodeRemover);

            foreach ($emailsLiberados as $email) {
                factory(App\Model\BlackList::class)->create([
                    'black_list_mail' => $email,
                    'black_list_data_inclusao' => date('Y-m-d H:i:s', strtotime('-5 days'))
                ]);
            }

            foreach ($emailsBloqueados as $email) {
                factory(App\Model\BlackList::class)->create([
                    'black_list_mail' => $email,
                    'black_list_data_inclusao' => date('Y-m-d H:i:s')
                ]);
            }
        }

	$this->command->info("--------------------------------------------------");
	$this->command->info("SEED CONCLUÍDA!");
	$this->command->info("--------------------------------------------------");
	$this->command->info("Total de Usuários Criados: {$totalUsuarios}");
	$this->command->info("Usuários na Blacklist: {$totalBlacklist}");
	$this->command->info(" -> Podem ser desbloqueados: " . count($emailsLiberados));
	$this->command->info(" -> Bloqueados (tempo mínimo): " . count($emailsBloqueados));
	$this->command->info("--------------------------------------------------");
    }
}