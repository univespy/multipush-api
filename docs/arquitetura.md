# Arquitetura do Sistema MultiPush

## Visão Geral

O MultiPush é uma API REST desenvolvida para a Multiteiner com o objetivo de substituir quadros de avisos físicos por notificações digitais via SMS. Gestores cadastram agendamentos de trabalho para colaboradores de campo, e o sistema dispara automaticamente uma mensagem SMS ao trabalhador com os detalhes do turno.

## Diagrama de Fluxo

```
[Gestor (Browser/Postman)]
        |
        | HTTPS - Bearer JWT
        v
[API NestJS - Porta 3000]
        |
        |--- TypeORM ---> [PostgreSQL - Porta 5432]
        |
        |--- Twilio SDK --> [Twilio API] --> [SMS ao Colaborador]
```

## Módulos

| Módulo | Responsabilidade |
|--------|-----------------|
| `AuthModule` | Login, registro de gestores, emissão e validação de JWT |
| `ManagersModule` | Entidade e serviço de gestores; fornece `findByEmail` e `findById` ao `AuthModule` |
| `CollaboratorsModule` | CRUD de colaboradores de campo com soft-delete |
| `SchedulesModule` | CRUD de agendamentos; orquestra o envio de SMS ao criar/atualizar |
| `NotificationsModule` | Persiste o log de cada tentativa de SMS (PENDING → SENT/FAILED) |
| `TwilioModule` | Encapsula o SDK do Twilio; exporta `TwilioService` |
| `AppController` | Endpoint `/health` para monitoramento |

## Dependências entre Módulos

```
AppModule
├── AuthModule
│   └── ManagersModule (importado para login/registro)
├── CollaboratorsModule (exporta CollaboratorsService)
├── SchedulesModule
│   ├── TwilioModule (importado para envio de SMS)
│   ├── NotificationsModule (importado para log de envio)
│   └── CollaboratorsModule (importado para buscar telefone)
└── NotificationsModule (exporta NotificationsService)
```

## Stack Tecnológica

| Componente | Tecnologia | Versão |
|------------|------------|--------|
| Framework | NestJS | ^11.0 |
| Linguagem | TypeScript | ^5.7 |
| Runtime | Node.js | 22 (Alpine) |
| ORM | TypeORM | latest |
| Banco de dados | PostgreSQL | 16 (Alpine) |
| Autenticação | JWT + Passport | @nestjs/jwt ^11 |
| Hashing de senha | bcrypt | latest |
| SMS | Twilio SDK | v5+ |
| Documentação | Swagger / OpenAPI 3 | @nestjs/swagger ^11 |
| Containerização | Docker + Compose | v3.9+ |

## Fluxo de Agendamento com SMS

1. Gestor autenticado envia `POST /schedules` com `collaboratorId`, data, horário e local
2. `SchedulesService.create()` persiste o agendamento no PostgreSQL
3. `sendScheduleNotification()` busca nome e telefone do colaborador
4. Uma notificação com status `PENDING` é criada no banco
5. `TwilioService.sendSms()` chama a API do Twilio
6. **Sucesso:** notificação atualizada para `SENT` com `twilioSid`
7. **Falha:** notificação atualizada para `FAILED`; o agendamento já foi salvo e a resposta HTTP é entregue normalmente

O mesmo fluxo ocorre em `PATCH /schedules/:id`.
