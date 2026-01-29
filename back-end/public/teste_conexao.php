<?php
// public/teste_conexao.php

$host = 'db';
$db   = 'censo';
$user = 'root';
$pass = 'root';
$charset = 'utf8';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "<h1>SUCESSO! Conexão estabelecida com app_dev.</h1>";

    // Teste de query simples
    $stmt = $pdo->query("SELECT VERSION()");
    $version = $stmt->fetchColumn();
    echo "Versão do MySQL: " . $version;

} catch (\PDOException $e) {
    echo "<h1>ERRO DE CONEXÃO</h1>";
    echo "Mensagem: " . $e->getMessage() . "<br>";
    echo "Código: " . $e->getCode();
}