<?php

$factory->define(App\Model\IdUsuarios::class, function (Faker\Generator $faker) {
    $sexo = $faker->randomElement(['M', 'F']);
    $nome = $faker->name($sexo == 'M' ? 'male' : 'female');

    $fotoGrande = 'https://ui-avatars.com/api/?name=' . urlencode($nome) . '&background=random&color=fff&size=400';
    $fotoMini = 'https://ui-avatars.com/api/?name=' . urlencode($nome) . '&background=random&color=fff&size=100';

    return [
        'usua_nome' => $nome,
        'usua_login' => $faker->unique()->userName,
        'usua_email' => $faker->unique()->safeEmail,
        'usua_cpf' => $faker->numerify('###########'),
        'usua_sexo' => $sexo,
        'usua_data_nascimento' => $faker->dateTimeBetween('-60 years', '-18 years')->format('Y-m-d'),
        'usua_foto' => $fotoGrande,
        'usua_foto_miniatura' => $fotoMini,
        'usua_ativo' => 1,
        'usua_gerar_senha_token' => str_random(10),
        'usua_requisicao_token' => rand(100, 999),
    ];
});

$factory->define(App\Model\InstituicaoUsuarios::class, function (Faker\Generator $faker) {
    return [
        'inst_codigo' => 1,
        'inst_usua_codigo' => $faker->unique()->numerify('2024####'),
        'inst_usua_idioma' => $faker->randomElement(['P', 'I', 'E']),
        'inst_usua_funcao' => 'Professor',
        'inst_usua_indicador_push_mens' => 1,
        'inst_usua_indicador_push_solicitacoes' => 1,
        'inst_usua_cadastro_automatico' => 0
    ];
});

$factory->define(App\Model\UsuarioPerfil::class, function (Faker\Generator $faker) {
    return [
        'perf_id' => 2,
        'ano_leti_id' => 2023,
        'usua_perf_cadastro_automatico' => 0
    ];
});

$factory->define(App\Model\BlackList::class, function (Faker\Generator $faker) {
    return [
        'black_list_data_inclusao' => date('Y-m-d H:i:s'),
        'black_list_contador' => $faker->numberBetween(1, 5),
        'black_list_aws_mesage' => 'Hard Bounce - User not found',
        'black_list_motivo' => $faker->randomElement(['Hard Bounce', 'Spam Report', 'Complaint'])
    ];
});