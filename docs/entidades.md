# Entidades do Banco de Dados

## Manager (Gestor)

Representa os administradores que acessam o sistema via interface web.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|-----------|
| `id` | UUID | Identificador único | PK, gerado automaticamente |
| `name` | string | Nome completo do gestor | NOT NULL |
| `email` | string | E-mail de acesso | NOT NULL, UNIQUE |
| `password` | string | Hash bcrypt da senha | NOT NULL, nunca retornado pela API |
| `createdAt` | timestamptz | Data de criação | Auto-preenchido |
| `updatedAt` | timestamptz | Última atualização | Auto-atualizado |

> **Atenção:** O campo `password` armazena somente o hash bcrypt (10 rounds). A senha em texto plano nunca é persistida nem retornada pela API.

---

## Collaborator (Colaborador)

Representa os trabalhadores de campo que recebem notificações via SMS.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|-----------|
| `id` | UUID | Identificador único | PK, gerado automaticamente |
| `name` | string | Nome completo do colaborador | NOT NULL |
| `phone` | string | Número de telefone no formato E.164 | NOT NULL, ex: `+5511999999999` |
| `active` | boolean | Indica se o colaborador está ativo | Default: `true` |
| `createdAt` | timestamptz | Data de criação | Auto-preenchido |
| `updatedAt` | timestamptz | Última atualização | Auto-atualizado |

> **Soft-delete:** `DELETE /collaborators/:id` define `active = false` em vez de remover o registro. Isso preserva o histórico de notificações.

---

## Schedule (Agendamento)

Representa um turno de trabalho atribuído a um colaborador.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|-----------|
| `id` | UUID | Identificador único | PK, gerado automaticamente |
| `collaboratorId` | UUID | FK para Collaborator | NOT NULL, CASCADE DELETE |
| `date` | date | Data do turno | NOT NULL, formato YYYY-MM-DD |
| `startTime` | string(5) | Hora de início | NOT NULL, formato HH:MM |
| `endTime` | string(5) | Hora de término | NOT NULL, formato HH:MM |
| `location` | string | Local de trabalho | NOT NULL |
| `notes` | text | Observações adicionais | Opcional |
| `createdAt` | timestamptz | Data de criação | Auto-preenchido |
| `updatedAt` | timestamptz | Última atualização | Auto-atualizado |

**Relacionamento:** N agendamentos → 1 Collaborator (ManyToOne)

---

## Notification (Notificação / Log de SMS)

Registra cada tentativa de envio de SMS pelo sistema.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|-----------|
| `id` | UUID | Identificador único | PK, gerado automaticamente |
| `scheduleId` | UUID | Referência ao agendamento | Nullable (SET NULL ao deletar) |
| `collaboratorId` | UUID | Referência ao colaborador | Nullable |
| `message` | text | Texto completo da mensagem enviada | NOT NULL |
| `phone` | string | Número destinatário no momento do envio | NOT NULL |
| `status` | enum | Status da entrega | NOT NULL, veja tabela abaixo |
| `twilioSid` | string | ID da mensagem retornado pelo Twilio | Nullable |
| `sentAt` | timestamptz | Momento de confirmação de envio | Nullable |
| `createdAt` | timestamptz | Momento de criação do log | Auto-preenchido |

### Enum NotificationStatus

| Valor | Significado |
|-------|-------------|
| `PENDING` | Registro criado, envio ainda não tentado ou em andamento |
| `SENT` | Twilio aceitou a mensagem com sucesso (`twilioSid` preenchido) |
| `FAILED` | Twilio retornou erro; mensagem não entregue |

> **Nota:** A tabela `notifications` é somente leitura via API. Os registros são criados e atualizados automaticamente pelo `SchedulesService`.

---

## Diagrama de Relacionamentos

```
Manager
  (sem FK para outras entidades — acesso via JWT)

Collaborator (1)
    |
    | (1:N)
    v
Schedule (N) ---------> Notification (N)
                              ^
                              |
                        Collaborator (referência denormalizada)
```
