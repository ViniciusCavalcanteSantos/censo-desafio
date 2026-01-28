# Guia de Repasse do Projeto Censo Back-end

## 1. Requisitos do Ambiente

- **Sistema Operacional:** Linux ou Windows (preferencialmente Linux para Docker)
- **Docker** (recomendado para ambiente isolado)
- **PHP 7.0**
- **Composer**
- **MySQL**
- **Git**
- **Acesso ao repositório do projeto**

---

## 2. Configuração do Ambiente

- Copie o arquivo `.env.example` para `.env` (já existe um `.env` de exemplo).
- Configure as variáveis do banco de dados no `.env` conforme necessário:

```env
DB_CONNECTION=mysql
DB_HOST=<host>
DB_PORT=3306
DB_DATABASE=semchamada_ng
DB_USERNAME=<usuario>
DB_PASSWORD=<senha>
DB_COMPARTILHADOS_DATABASE=compartilhados
DB_CENSO=censo
DB_EMAIL_DATABASE=email
```

- Ajuste outros parâmetros conforme o ambiente (ex: `APP_ENV`, `APP_DEBUG`, `APP_TIMEZONE`).

---

## 3. Banco de Dados

### Criação dos Bancos e Tabelas

Para facilitar a configuração inicial, utilize o arquivo `exemplo_base.sql` que acompanha o projeto.  
Esse arquivo já contém os comandos para criar os bancos de dados, tabelas e inserir dados mínimos de exemplo.

**Como importar a base de dados de exemplo:**

1. Certifique-se que o MySQL está rodando e você tem um usuário com permissão para criar bancos e tabelas.
2. Execute o comando abaixo no terminal, na pasta do projeto:

    ```sh
    mysql -u <usuario> -p < exemplo_base.sql
    ```

3. Após a importação, os bancos `compartilhados`, `censo` e `email` estarão criados e populados com dados fictícios para testes.

---

## 4. Instalação das Dependências

### Via Docker (recomendado)

1. **Build da imagem:**
    ```sh
    docker build -t censo-back-end .
    ```

2. **Criação do container:**
    ```sh
    docker run --name censo-back -it -v "$(pwd)":/var/www/html/ -p 8000:8000 censo-back-end
    ```

3. **Instalação das dependências dentro do container:**
    ```sh
    composer install
    ```

4. **Iniciar o serviço:**
    ```sh
    php -S 0.0.0.0:8000 -t public
    ```

### Sem Docker

1. Instale o PHP 7.0 e Composer.
2. Instale as dependências:
    ```sh
    composer install
    ```
3. Inicie o servidor:
    ```sh
    php -S 0.0.0.0:8000 -t public
    ```

---

## 5. Configuração do Projeto

- O arquivo `config/database.php` define os bancos e schemas utilizados.
- O projeto utiliza **Lumen** (Laravel micro-framework).
- As queries utilizam os schemas configurados via `.env`.

---

## 6. Arquitetura do Projeto

- **Repository:** Camada de acesso a dados (ex: `InstituicaoUsuarioRepository.php`)
- **Service:** Camada de regras de negócio (não enviado, mas padrão do projeto)
- **Model:** Representação das entidades (não enviado, mas padrão do projeto)
- **Controller:** Recebe requisições HTTP (não enviado, mas padrão do projeto)

---

## 7. Execução e Testes

- Acesse o sistema via navegador ou Postman em `http://localhost:8000`.
- Utilize os endpoints definidos nos controllers (consultar documentação interna ou código).
- Para rodar testes:
    ```sh
    composer test
    ```

---

## 8. Documentação e Suporte

- Consulte o `README.md` para comandos básicos de Docker e execução.
- Documente endpoints, exemplos de payloads e respostas.
- Informe contatos para dúvidas (se aplicável).

---

## 9. Checklist Final

- [ ] Repositório clonado
- [ ] Bancos de dados criados e tabelas populadas (usando `exemplo_base.sql`)
- [ ] `.env` configurado
- [ ] Dependências instaladas
- [ ] Servidor iniciado
- [ ] Testes executados
- [ ] Documentação entregue

---

## Observações Importantes

- O projeto depende de três bancos/schemas distintos. Certifique-se de que todos estão acessíveis e corretamente configurados.
- As queries SQL utilizam `config('database.<schema>')` para montar os nomes dos bancos/tabelas.
- O projeto utiliza Lumen, então comandos do Laravel podem não funcionar (ex: migrations, se não estiverem implementadas).

---

