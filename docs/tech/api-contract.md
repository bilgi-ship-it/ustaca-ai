# API Contract

## Modules

- auth
- customers
- sites
- trials
- billing
- domains
- forms
- appointments
- support
- ai
- notifications
- admin
- whatsapp

## Endpoints

### Panel API

#### WhatsApp Webhook

- `GET /api/whatsapp/webhook`
  - Meta Webhook verify asamasinda `hub.mode`, `hub.verify_token`, `hub.challenge` query param'larini kullanir.
  - Sunucu tarafinda `WHATSAPP_VERIFY_TOKEN` env degiskeni beklenir.
  - Dogrulama basarili olursa `hub.challenge` plain text doner.

- `POST /api/whatsapp/webhook`
  - WhatsApp Cloud API event payload'ini JSON olarak kabul eder.
  - Su an icin payload saklanmaz; endpoint sadece alimi dogrulayan bir acknowledgement doner.
