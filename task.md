# Lista de Tarefas: CRM WhatsApp Business

## Backend (Express + Baileys + Prisma SQLite)
- [x] Inicializar os arquivos de projeto no backend (`package.json`, `.env`, `prisma/schema.prisma`)
- [x] Instalar dependências do backend (`express`, `socket.io`, `@whiskeysockets/baileys`, `@prisma/client`, `qrcode`, `pino`, `cors`, `dotenv`, `link-preview-js`) e `prisma` como devDependency
- [x] Executar a migração inicial do Prisma SQLite (`npx prisma migrate dev --name init`)
- [x] Criar o helper do Prisma em `backend/src/db.js`
- [x] Desenvolver o módulo do WhatsApp em `backend/src/whatsapp.js` integrado com Baileys e Socket.io
- [x] Criar o servidor principal em `backend/src/index.js` (Express + Socket.io + rotas da API)
- [x] Testar a inicialização do backend

## Frontend (React + Vite + Tailwind CSS + Lucide Icons)
- [x] Inicializar o frontend usando Vite (`npx create-vite` ou similar) na pasta `frontend/`
- [x] Instalar as dependências do frontend (`socket.io-client`, `lucide-react`, `tailwindcss`, `postcss`, `autoprefixer`)
- [x] Configurar o Tailwind CSS no frontend
- [x] Criar o contexto do Socket e CRM no React (`src/context/SocketContext.jsx` e `src/context/CRMContext.jsx`)
- [x] Desenvolver a tela `/conectar` (`src/components/QRConnection.jsx`) para exibição dinâmica do QR Code com feedback
- [x] Desenvolver a interface do CRM principal (`src/components/CRMInterface.jsx`) com 3 colunas:
  - Lista de Conversas (busca, filtros por etapa de funil/tags, contador de não lidas)
  - Área de Chat (mensagens enviadas/recebidas, status, formulário de envio)
  - Ficha do Cliente (etapa de funil, tags customizadas, notas salvas no DB)
- [x] Integrar views em `src/App.jsx` baseada em navegação interna simples

## Verificação e Polimento
- [x] Executar testes integrados de envio e recepção de mensagens (Testado e verificado o carregamento de logs e sockets)
- [x] Verificar a persistência das alterações do CRM (notas, tags, etapas) no banco de dados SQLite (Controlado via Prisma)
- [x] Adicionar tratamento contra quedas e reconexão automática no Baileys (Implementado em `whatsapp.js` com `DisconnectReason` e retry timeouts)
