# Configuração e Execução

## Pré-requisitos

- [Node.js 22+](https://nodejs.org)
- [Docker](https://www.docker.com) e [Docker Compose](https://docs.docker.com/compose/)
- Conta no [Twilio](https://www.twilio.com) com número de telefone habilitado para SMS

---

## Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com os valores reais:

```bash
cp .env.example .env
```

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `PORT` | Porta da API | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` / `production` |
| `DB_HOST` | Host do PostgreSQL | `localhost` (dev) / `db` (Docker) |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USERNAME` | Usuário do banco | `multipush` |
| `DB_PASSWORD` | Senha do banco | `multipush_secret` |
| `DB_DATABASE` | Nome do banco | `multipush_db` |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT | string aleatória longa |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `8h` |
| `TWILIO_ACCOUNT_SID` | Account SID do Twilio | `ACxxxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Auth Token do Twilio | `your_auth_token` |
| `TWILIO_PHONE_NUMBER` | Número remetente (E.164) | `+15551234567` |

---

## Opção 1: Docker Compose (Recomendado)

Sobe o banco de dados PostgreSQL **e** a aplicação em containers:

```bash
# 1. Copiar e preencher o .env
cp .env.example .env

# 2. Subir todos os serviços
docker compose up --build

# Para rodar em background
docker compose up --build -d

# Para parar
docker compose down
```

A API estará disponível em `http://localhost:3000`.  
O Swagger UI estará em `http://localhost:3000/api`.

> **Nota:** O container `api` aguarda o healthcheck do `db` ser aprovado antes de iniciar. Na primeira execução, o TypeORM cria automaticamente as tabelas (`synchronize: true` em desenvolvimento).

---

## Opção 2: Banco via Docker + API Local (Desenvolvimento)

Útil para hot-reload durante o desenvolvimento:

```bash
# 1. Subir apenas o banco
docker compose up db -d

# 2. Instalar dependências
npm install

# 3. Garantir que DB_HOST=localhost no .env
# (padrão no .env.example)

# 4. Iniciar a API em modo watch
npm run start:dev
```

---

## Opção 3: Produção (sem Docker)

```bash
npm run build
NODE_ENV=production node dist/main
```

Em produção, `synchronize` é desabilitado automaticamente. Use migrações TypeORM para alterações de schema.

---

## Verificação

Após iniciar a aplicação, confirme que está funcionando:

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"2026-..."}
```

Acesse o Swagger UI: [http://localhost:3000/api](http://localhost:3000/api)
