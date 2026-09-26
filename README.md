# PixelCRM — Sistema Comercial & CRM WhatsApp para Shineray Motos

O **PixelCRM** é uma plataforma corporativa completa de atendimento comercial, qualificação de leads e gestão de vendas via WhatsApp, desenvolvida sob rigorosos princípios constitucionais de integridade de software (**zero dados falsos, zero mocks e 100% de persistência transacional**).

---

## 🚀 Arquitetura Full-Stack

* **Backend**:
  * **Runtime**: Node.js (ES Modules)
  * **API REST & WebSocket**: Express 4 + Socket.IO 4 (Eventos em tempo real)
  * **Motor WhatsApp**: `@whiskeysockets/baileys` nativo (envio de mensagens, áudios, mídias e automações)
  * **ORM & Banco de Dados**: Prisma ORM com SQLite transacional (`dev.db`)
  * **Segurança**: Autenticação JWT (7 dias), senhas criptografadas com `bcryptjs` e RBAC (`ADMIN`, `OPERATOR`)
  * **Inteligência Artificial**: Módulo nativo com suporte direto às APIs oficiais do Google Gemini e OpenAI

* **Frontend**:
  * **Framework**: React 18 + Vite
  * **Estilização**: Tailwind CSS (Design System responsivo estilo WhatsApp Web / Light Mode)
  * **Ícones**: Lucide React
  * **Reprodução Multimídia**: Player de áudio integrado com controle de velocidade (1x, 1.5x, 2x) e busca textual

---

## 🏆 As 10 Fases Concluídas do Plano Mestre

1. **Fase 01 — Blindagem Estrutural & Segurança do Backend**: Autenticação JWT, senhas hashadas em bcrypt, RBAC e separação de logout/desconexão.
2. **Fase 02 — Chat Real: Desbloqueio e Confiabilidade de Envio**: Envio assíncrono real via Baileys com retenção de texto e feedback instantâneo.
3. **Fase 03 — Limpeza de Fachadas e Dados Falsos**: Eliminação de todos os mocks, simulações em memória e dados fictícios.
4. **Fase 04 — Mídias Reais, Mensagens de Voz & Busca Interna**: Download e player real de áudios/áudio-notas do WhatsApp e busca dentro do chat.
5. **Fase 05 — Multi-Usuário Real, Filiais & Gestão de Atendentes**: CRUD de lojas/filiais, alocação de atendentes aos leads e painel administrativo.
6. **Fase 06 — Pipeline Comercial Real & Kanban Funcional**: Drag & Drop HTML5 com 4 estágios (`Leads`, `Em Negociação`, `Proposta`, `Contrato Fechado`) sincronizados com o banco.
7. **Fase 07 — Dashboard Real & Métricas de Atendimento**: Agregações analíticas reais de conversão, volume de mensagens por dia, ranking de filiais e operadores.
8. **Fase 08 — Automações Reais & Regras de Atendimento**: Respostas automáticas de boas-vindas e horário comercial com proteção anti-flood de 12 horas.
9. **Fase 09 — Integração Real de IA (LLM Copilot)**: Sugestão de respostas comerciais, refinamento de rascunhos e resumos via Google Gemini / OpenAI.
10. **Fase 10 — Estabilidade, Escalabilidade & Deploy de Produção**: Healthchecks (`/api/health`), Dockerfiles, Nginx SPA, Docker Compose e Graceful Shutdown.

---

## 🔑 Credenciais Padrão de Acesso

* **E-mail do Administrador**: `shinerayl1mh@view.com`
* **Senha**: `hadade123`

---

## 🛠️ Como Rodar em Desenvolvimento Local

### 1. Pré-requisitos
* Node.js v18 ou superior instalado.

### 2. Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```
O backend iniciará na porta `5000` (`http://localhost:5000`).

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
O frontend iniciará na porta `5173` (`http://localhost:5173`).

---

## 🐳 Como Rodar em Produção com Docker Compose

Para subir toda a aplicação (Frontend + Backend + Banco SQLite + Volumes Persistentes) com apenas um comando:

```bash
docker compose up -d --build
```

### Serviços Criados:
* **Frontend Nginx**: Disponível em `http://localhost` (Porta 80).
* **Backend API**: Disponível em `http://localhost:5000`.
* **Volumes Persistentes**:
  * `shineray_baileys_auth`: Preserva a sessão conectada do WhatsApp Web mesmo após reiniciar os contêineres.
  * `shineray_prisma_data`: Preserva o banco de dados `dev.db` com todo o histórico e cadastros.

---

## 🩺 Monitoramento & Healthcheck

O sistema disponibiliza um endpoint público de diagnóstico:

```http
GET http://localhost:5000/api/health
```

**Exemplo de Resposta:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "PixelCRM-Shineray-Backend",
  "uptime": {
    "seconds": 3600,
    "formatted": "1h 0m 0s"
  },
  "database": {
    "status": "healthy",
    "dialect": "sqlite"
  },
  "whatsapp": {
    "connection": "connected",
    "authenticated": true
  }
}
```

---

## 📄 Licença
Desenvolvido exclusivamente para a operação comercial da rede de concessionárias Shineray Motos.
