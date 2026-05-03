# Notificações SMS com Twilio

## Como Funciona

O MultiPush envia SMS automaticamente sempre que um agendamento é **criado** (`POST /schedules`) ou **atualizado** (`PATCH /schedules/:id`). O colaborador de campo recebe a mensagem no número cadastrado sem precisar ter acesso ao sistema.

---

## Configuração da Conta Twilio

1. Acesse [twilio.com](https://www.twilio.com) e crie uma conta gratuita
2. No painel do Twilio, localize:
   - **Account SID** (começa com `AC`)
   - **Auth Token**
3. Adquira um número de telefone habilitado para SMS
4. Preencha as variáveis no `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_PHONE_NUMBER=+15551234567
```

> **Conta Trial:** Contas gratuitas do Twilio só podem enviar SMS para números verificados. Para testar, verifique seu número pessoal no painel do Twilio em *Phone Numbers → Verified Caller IDs*.

---

## Formato da Mensagem

A mensagem enviada ao colaborador segue este padrão:

```
Olá {nome}! Você tem um agendamento em {data} das {início} às {fim} em {local}. Obs: {notas}
```

**Exemplo:**
```
Olá Carlos Pereira! Você tem um agendamento em 2026-05-10 das 08:00 às 17:00 em Av. Paulista, 1000 - São Paulo. Obs: Levar EPI completo
```

O campo `Obs:` só aparece se `notes` foi preenchido no agendamento.

---

## Ciclo de Vida de uma Notificação

```
[POST /schedules]
      |
      v
createPending()  ──> status: PENDING
      |
      v
TwilioService.sendSms()
      |
      |--- Sucesso ---> markSent(twilioSid) ──> status: SENT
      |
      └--- Falha -----> markFailed()        ──> status: FAILED
```

**Comportamento em caso de falha:** O agendamento já foi salvo com sucesso no banco de dados. A falha no SMS **não reverte** o agendamento. O log de notificação com `status: FAILED` permite identificar e reenviar manualmente, se necessário.

---

## Consultando o Histórico de Notificações

```bash
# Listar todas as notificações (requer JWT)
curl -H "Authorization: Bearer <token>" http://localhost:3000/notifications

# Exemplo de resposta
[
  {
    "id": "uuid",
    "scheduleId": "uuid-do-agendamento",
    "collaboratorId": "uuid-do-colaborador",
    "message": "Olá Carlos Pereira! ...",
    "phone": "+5511999999999",
    "status": "SENT",
    "twilioSid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "sentAt": "2026-05-03T10:05:00.000Z",
    "createdAt": "2026-05-03T10:05:00.000Z"
  }
]
```

---

## Credenciais de Teste do Twilio

O Twilio fornece números mágicos para testes sem custo:

| Número | Comportamento |
|--------|---------------|
| `+15005550006` | Número remetente válido (use em `TWILIO_PHONE_NUMBER`) |
| `+15005550001` | Destinatário que sempre falha na entrega |
| `+15005550004` | Destinatário em lista negra |

Use esses números para testar o fluxo de falha (`status: FAILED`) sem consumir créditos.

---

## Formato de Número (E.164)

Todos os telefones de colaboradores devem ser registrados no formato **E.164**:

- Formato: `+[código do país][DDD][número]`
- Brasil: `+55` + DDD (2 dígitos) + número (8 ou 9 dígitos)
- Exemplos:
  - `+5511999999999` — São Paulo (celular)
  - `+5521988888888` — Rio de Janeiro (celular)

O sistema valida esse formato automaticamente no `POST /collaborators`. Números fora do padrão são rejeitados com HTTP 400.
