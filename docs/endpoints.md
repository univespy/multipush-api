# Endpoints da API

A documentação interativa completa está disponível em `/api` (Swagger UI) após iniciar a aplicação.

## Autenticação

Todos os endpoints — exceto `/health`, `POST /auth/register` e `POST /auth/login` — requerem um token JWT no cabeçalho:

```
Authorization: Bearer <access_token>
```

---

## Auth

### POST /auth/register

Cria um novo gestor no sistema.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "password": "senhaSegura123"
}
```

**Resposta 201:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "createdAt": "2026-05-03T10:00:00.000Z",
  "updatedAt": "2026-05-03T10:00:00.000Z"
}
```

**Resposta 409:** E-mail já cadastrado.

---

### POST /auth/login

Autentica um gestor e retorna o token JWT.

**Body:**
```json
{
  "email": "joao@empresa.com",
  "password": "senhaSegura123"
}
```

**Resposta 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta 401:** Credenciais inválidas.

---

## Managers

### GET /managers/me

Retorna o perfil do gestor autenticado. **Requer JWT.**

**Resposta 200:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "email": "joao@empresa.com",
  "createdAt": "2026-05-03T10:00:00.000Z",
  "updatedAt": "2026-05-03T10:00:00.000Z"
}
```

---

## Collaborators

Todos os endpoints requerem JWT.

### POST /collaborators

**Body:**
```json
{
  "name": "Carlos Pereira",
  "phone": "+5511999999999"
}
```

**Resposta 201:** Objeto do colaborador criado.

**Resposta 400:** Telefone em formato inválido (deve ser E.164).

---

### GET /collaborators

Lista todos os colaboradores ativos (`active = true`).

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "name": "Carlos Pereira",
    "phone": "+5511999999999",
    "active": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### GET /collaborators/:id

Busca um colaborador ativo por ID (UUID).

**Resposta 200:** Objeto do colaborador.
**Resposta 404:** Colaborador não encontrado.

---

### PATCH /collaborators/:id

Atualiza `name` e/ou `phone` (ambos opcionais).

**Body:**
```json
{
  "phone": "+5511888888888"
}
```

**Resposta 200:** Objeto atualizado.

---

### DELETE /collaborators/:id

Desativa o colaborador (soft-delete: `active = false`). O registro permanece no banco.

**Resposta 204:** Sem corpo.
**Resposta 404:** Colaborador não encontrado.

---

## Schedules

Todos os endpoints requerem JWT. Criar ou atualizar um agendamento **dispara automaticamente um SMS** ao colaborador.

### POST /schedules

**Body:**
```json
{
  "collaboratorId": "uuid-do-colaborador",
  "date": "2026-05-10",
  "startTime": "08:00",
  "endTime": "17:00",
  "location": "Av. Paulista, 1000 - São Paulo",
  "notes": "Levar EPI completo"
}
```

**Resposta 201:** Objeto do agendamento + SMS disparado ao colaborador.

**Resposta 400:** Dados inválidos (formato de data, horário, UUID).

---

### GET /schedules

Lista todos os agendamentos ordenados por data e horário de início, com dados do colaborador incluídos.

---

### GET /schedules/:id

Busca um agendamento por ID com dados do colaborador.

---

### PATCH /schedules/:id

Atualiza qualquer campo do agendamento. Todos os campos são opcionais. **Dispara novo SMS** ao colaborador.

---

### DELETE /schedules/:id

Remove o agendamento permanentemente.

**Resposta 204:** Sem corpo.

---

## Notifications

Somente leitura. Requer JWT.

### GET /notifications

Lista todo o histórico de envios SMS, ordenado do mais recente ao mais antigo.

**Resposta 200:**
```json
[
  {
    "id": "uuid",
    "scheduleId": "uuid",
    "collaboratorId": "uuid",
    "message": "Olá Carlos Pereira! Você tem um agendamento em 2026-05-10...",
    "phone": "+5511999999999",
    "status": "SENT",
    "twilioSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "sentAt": "2026-05-03T10:05:00.000Z",
    "createdAt": "2026-05-03T10:05:00.000Z"
  }
]
```

---

### GET /notifications/:id

Busca uma notificação por ID.

---

## Health

### GET /health

Verificação de status da API. **Não requer autenticação.**

**Resposta 200:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-03T10:00:00.000Z"
}
```

---

## Tabela de Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (DELETE) |
| 400 | Dados inválidos (validação) |
| 401 | Não autorizado (token ausente ou inválido) |
| 404 | Recurso não encontrado |
| 409 | Conflito (e-mail já cadastrado) |
| 500 | Erro interno do servidor |
