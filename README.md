# Desafio Técnico

[![PHP](https://img.shields.io/badge/PHP-7.4+-8892BF?logo=php&logoColor=white)](https://www.php.net/)
[![Angular](https://img.shields.io/badge/Angular-Modern-red?logo=angular&logoColor=white)](https://angular.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker&logoColor=white)](https://www.docker.com/)
[![MySQL](https://img.shields.io/badge/MySQL-5.7-orange?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/license-MIT-brightgreen)](#licença)
[![Status](https://img.shields.io/badge/status-ready-brightgreen)]()

> Desafio: Desenvolver em um projeto legado, utilizando a mesma stack e
padrões existentes no back-end, e construir do zero a camada de front-end necessária para
integrar as funcionalidades pedidas.

---

## Sumário

- [Destaques](#destaques)
- [Pré-requisitos](#pré-requisitos)
- [Instalação & Execução (Docker)](#instalação--execução-docker)
- [Regras de Negócio (Blacklist)](#regras-de-negócio-blacklist)
- [Documentação da API](#documentação-da-api)
- [Front-end (comportamento)](#front-end-comportamento)
- [Testes](#testes)

---

## Destaques

- **Back-end:** Lumen (PHP 7) — compatibilidade com código legado.
- **Front-end:** Angular 21.
- **Regra principal:** O sistema permite a listagem, edição e remoção controlada de usuários de uma blacklist, respeitando regras de negócio.
- **Deployment:** orquestração via Docker Compose.

---

## Pré-requisitos

- Docker e Docker Compose

---

## Instalação & Execução (Docker)

1. Clone o repositório:
```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_PROJETO>
```

2. Suba os containers:
```bash
docker-compose up -d --build
```

3. Endpoints:
- Front-end: `http://localhost:4200`
- API: `http://localhost:8000`
- MySQL: porta `3306` (usuário: `root` / senha: `root`, database: `censo`)

> Observação: o banco pode vai ser iniciado automaticamente já polulado.

---

## Regras de Negócio (Blacklist)

O sistema possui um mecanismo de proteção para a remoção de e-mails da blacklist, garantindo que um usuário não seja removido imediatamente após a inclusão.

### 1. Bloqueio Temporal
* **Restrição de Tempo:** Quando um e-mail entra na blacklist, ele só pode ser removido após cumprir um **tempo mínimo** definido nas configurações do sistema (No arquivo back-end/config/constants.php na variavel HORAS_MINIMAS_BLACKLIST, mas o valor padrão tá de 24 horas)
* **Validação:** Caso tente remover o e-mail antes desse período, a operação será bloqueada.

### 2. Comportamento da API
* **Tentativa Bloqueada (403 Forbidden):** Se o tempo mínimo ainda não foi atingido, a API retorna um erro explícito informando a quantidade de horas restantes para a liberação.
* **Tentativa Permitida (200 OK):** Se o tempo decorrido for maior ou igual ao mínimo exigido, o e-mail é removido da blacklist com sucesso.

### 3. Interface do Usuário
* **Indicadores Visuais:** A listagem de usuários identifica claramente quem está na blacklist através de ícones.
* **Feedback Proativo:**
    * Se o usuário estiver bloqueado, um *tooltip* informa que é necessário aguardar.
    * Se o usuário estiver liberado, a interface permite a ação de remoção mediante confirmação.
---

## Documentação da API

### 1) Listar Usuários
- **URL:** `GET /instituicao_usuarios/listar`
- **Headers:** `inst_codigo: 1`
- **Resposta (exemplo):**
```json
{
  "success": true,
  "data": [
    {
      "inst_usua_id": 15,
      "inst_usua_codigo": "20243410",
      "usua_nome": "Amie Osinski",
      "usua_email": "aletha.shanahan@example.com",
      "usua_cpf": "94955330702",
      "usua_sexo": "F",
      "usua_foto": "https://ui-avatars.com/api/?name=Amie+Osinski&background=random&color=fff&size=400",
      "usua_foto_miniatura": "https://ui-avatars.com/api/?name=Amie+Osinski&background=random&color=fff&size=100",
      "usua_data_nascimento": "1972-02-23",
      "usuario_perfil": "Diretor",
      "is_blacklisted": 1,
      "blacklist_deadline": "2026-01-25 20:19:26",
      "can_be_removed": 1
    }
  ],
  "meta": {
    "total": 60,
    "page": 1,
    "last_page": 1,
    "per_page": 100
  }
}
```

### 2) Remover da Blacklist
- **URL:** `DELETE /instituicao_usuarios/blacklist/remover`
- **Body (JSON):**
```json
{
  "email": "maria@teste.com"
}
```
- **Respostas:**
    - **200 OK (sucesso):**
  ```json
  { "success": true, "message": "E-mail removido com sucesso!" }
  ```
    - **403 Forbidden (tempo insuficiente):**
  ```json
  { "success": false, "message": "Aguarde X horas para remover este e-mail novamente." }
  ```

### 3) salva as informações alterada da Blacklist
- **URL:** `POST /instituicao_usuarios/blacklist/salvar`
- **Headers:** `inst_codigo: 1`
- **Body (JSON):**
```json
{
  "inst_usua_id": 1,
  "usuario_nome": "Guilherme Santos",
  "usuario_email": "guilherme@libro.studio",
  "usuario_codigo": "MAT12345",
  "usuario_cpf": "12345678901",
  "usuario_funcao": "Desenvolvedor",
  "usuario_sexo": "M",
  "data_nascimento": "2000-01-28"
}
```
- **Respostas:**
    - **200 OK (sucesso):**
  ```json
  { "success": true, "message": "Usuário salvo com sucesso!" }
  ```
    - **422 Forbidden (tempo insuficiente):**
  ```json
  { "success": false, "message": "O campo inst usua id é obrigatório." }
  ```



---

## Front-end (comportamento)

- Tabela de listagem com nome, e-mail, perfil e status da blacklist.
- Ícone indicador para e-mails na blacklist + tooltip que informa:
    - tempo restante para remoção, ou
    - ação disponível ("Remover da blacklist").
- Ao clicar (quando permitido) → modal de confirmação → chamada ao endpoint DELETE → atualização da lista.
- Edição de usuário com formulário e botão "Remover da Blacklist" (mesma validação).

---

## Testes

Executar:
```bash
cd front-end
npm test ou ng test
```

Cobertura:
- Renderização da tabela e components.
- Lógica do ícone/tooltip.
- Modal e fluxo de remoção.
- Serviço que consome a API (mock).

---
