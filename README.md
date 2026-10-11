# Cookie Pitada de Amor

## Publicação no Easypanel

O projeto é uma aplicação Vite/React estática, pronta para ser publicada com o `Dockerfile` deste repositório.

1. No Easypanel, crie um **Project** e um serviço **App** conectado a este repositório Git.
2. Em **Build**, escolha **Dockerfile**. O container expõe a porta `80`.
3. Em **Environment**, crie as variáveis abaixo **antes do deploy**. Como são variáveis `VITE_`, elas são incluídas no build e apenas valores públicos podem ser usados.

   ```text
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   VITE_N8N_CREATE_ORDER_WEBHOOK_URL=https://webhook.dev.axionai.com.br/webhook/criar-pedido
   VITE_ORDER_SIMULATION=false
   ```

4. Em **Domains**, associe `cookiepitadadeamor.com.br` e `www.cookiepitadadeamor.com.br`, habilitando HTTPS/Let's Encrypt.
5. No DNS da Hostinger, crie dois registros `A` (um para `@` e outro para `www`) apontando para o IP público da VPS. Remova registros conflitantes para esses hosts.
6. Depois da propagação do DNS, faça o deploy. O `nginx.conf` já possui o fallback necessário para links diretos a `/checkout/<order_id>`.

> Nunca use uma chave `service_role` do Supabase, token administrativo do n8n ou credenciais privadas em variáveis `VITE_`.

## Testar o webhook de pedidos

Com a campanha em status `open`, execute:

```bash
curl -X POST "https://webhook.dev.axionai.com.br/webhook/criar-pedido" -H "Content-Type: application/json" -d '{"full_name":"Teste","whatsapp":"5511912345678","contact_consent":true,"items":[{"product_id":1,"quantity":1}],"session_id":"teste"}'
```
