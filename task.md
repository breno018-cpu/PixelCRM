# Plano Mestre de Execução do CRM (Constituição & Integridade)

- [x] **FASE 01 — Blindagem Estrutural & Segurança do Backend**
  - Autenticação real JWT (7 dias) com senhas criptografadas em bcrypt
  - Modelo `User` e índices no Prisma SQLite
  - Separação de `/api/logout` e `/api/disconnect` (sem apagar mensagens)
  - Proteção de todos os endpoints com RBAC e CORS rigoroso
  - Endpoint seguro de reset administrativo com senha

- [x] **FASE 02 — Chat Real: Desbloqueio e Confiabilidade de Envio**
  - Eliminação do bloqueio artificial de digitação e envio
  - Integração assíncrona real com `POST /api/chats/:id/messages`
  - Feedback visual verdadeiro de loading, retenção de texto em falhas e tratamento de erro

- [x] **FASE 03 — Limpeza de Fachadas e Dados Falsos**
  - Eliminação de todos os estados simulados e mocks (`simulatedKanbanStage`, `simulatedMessages`, `simulatedAiTyping`, etc.)
  - Remoção definitiva do modal falso de restrição "Operador Júnior" (`showAccessDeniedModal`)
  - Ocultação dos botões de fachada sem destino na barra lateral (`dashboard` e `automations`)
  - Remoção do falso "Copiloto IA / Anie" na gaveta de contato (gaveta 100% dedicada aos dados reais de CRM: funil, tags e anotações)
  - Substituição da foto de moto fictícia do Unsplash por placeholder honesto de mídia indisponível
  - Transformação do modal de ajuda em um Guia Operacional Real de 5 etapas sobre o sistema

- [x] **FASE 04 — Mídias Reais, Mensagens de Voz & Busca Interna**
  - Download e reprodução real de áudios/mensagens de voz do WhatsApp
  - Suporte e download de documentos e mídias reais
  - Busca interna de texto dentro da conversa ativa com contador e navegação

- [x] **FASE 05 — Multi-Usuário Real, Filiais & Gestão de Atendentes**
  - Modelagem e CRUD real de Lojas/Filiais no banco SQLite (`Store` model)
  - Vínculo real de conversas e clientes a atendentes e filiais (`storeId`, `assignedUserId`)
  - Controle de acesso RBAC com papéis `ADMIN` e `OPERATOR`
  - Modal completo de gestão administrativa de filiais e operadores
  - Filtros avançados por Filial e Atendente na listagem de conversas
  - Atribuição manual de Filial e Atendente diretamente na Ficha do Lead (gaveta CRM)
  - Badges informativas transparentes em cada card de conversa

- [x] **FASE 06 — Pipeline Comercial Real & Kanban Funcional**
  - Tela real de Kanban com arrastar e soltar (HTML5 Drag & Drop) atualizando diretamente o `funnelStage` no SQLite
  - 4 colunas comerciais padronizadas: `Leads`, `Em Negociação`, `Proposta Enviada`, `Contrato Fechado`
  - Cards detalhados com foto, nome, telefone, tags, última mensagem, filial e atendente responsável
  - Seletor rápido de troca de estágio no rodapé do card para facilidade de uso
  - Botão de acesso direto "Conversar" para abrir o chat instantaneamente
  - Filtros em tempo real por Filial, Atendente e campo de pesquisa por texto
  - Botão de alternância rápida entre Chats e Kanban na barra lateral e no topo da lista de conversas
  - Inclusão dos dados relacionais de `store` e `assignedUser` no retorno e broadcast via WebSocket de `PUT /api/chats/:id/crm`

- [x] **FASE 07 — Dashboard Real & Métricas de Atendimento**
  - Endpoint analítico real `GET /api/dashboard/stats` com agregação direta do SQLite
  - Métricas de resumo de leads totais, conversas ativas, arquivadas e taxa de conversão real
  - Distribuição do funil comercial com contagem e percentual proporcional por etapa
  - Métricas de mensagens trocadas: total, enviadas, recebidas e volume de hoje
  - Gráfico CSS/SVG de volume diário de mensagens nos últimos 7 dias
  - Relatório analítico por Filial com conversões e operadores alocados
  - Relatório de produtividade da Equipe com leads atribuídos, fechamentos e conversão individual
  - Filtros dinâmicos no Dashboard por Filial e Atendente com botão de atualização em tempo real
  - Nova aba de Dashboard na barra lateral esquerda (`activeTab === 'dashboard'`)

- [x] **FASE 08 — Automações Reais & Regras de Atendimento**
  - Modelo `Automation` e migração real no Prisma SQLite (`dev.db`)
  - Disparo nativo server-side no Baileys no evento `messages.upsert` com delay humano de 1.5s
  - Regra de Boas-Vindas (`WELCOME`) para novos clientes/leads
  - Regra de Horário Comercial (`OUT_OF_HOURS`) com janela de expediente e dias de atendimento
  - Proteção anti-flood inteligente com janela de 12 horas por contato (`lastAutoReplyTime`)
  - Endpoints REST autenticados `GET /api/automations` e `PUT /api/automations/:id`
  - Central de Automações completa no Frontend (`activeTab === 'automations'`) com toggles, seletores e auditoria em tempo real

- [x] **FASE 09 — Integração Real de IA (LLM Copilot)**
  - Modelo `AiConfig` e migração real no Prisma SQLite (`dev.db`)
  - Módulo nativo `aiService.js` com chamadas REST diretas à API oficial do Google Gemini e OpenAI
  - Endpoints REST autenticados `GET /api/ai/config`, `PUT /api/ai/config`, `POST /api/ai/test` e `POST /api/ai/suggest`
  - Proteção de segurança com mascaramento de chaves secretas (`maskedKey`)
  - Ações comerciais do Copiloto no Chat Ativo: **Sugerir Resposta**, **Melhorar Rascunho** e **Resumir Conversa**
  - Botão "Inserir no Chat" transferindo a sugestão gerada pela IA diretamente para o campo de envio da mensagem
  - Modal completo de Configuração de IA com troca de provedor (Gemini/OpenAI), seletor de modelos, slider de criatividade e teste em tempo real de conectividade

- [x] **FASE 10 — Estabilidade, Escalabilidade & Deploy de Produção**
  - Endpoint de monitoramento e integridade `GET /api/health` (status do banco, Baileys, memória e uptime)
  - Rotinas de encerramento seguro (Graceful Shutdown) com tratamento de `SIGTERM` e `SIGINT`
  - Dockerfile de produção do backend em Node 20 Alpine com cliente Prisma pré-compilado
  - Dockerfile multi-estágio do frontend com servidor web Nginx e suporte a roteamento SPA e compressão gzip
  - Configuração completa de orquestração com `docker-compose.yml` e volumes persistentes (`shineray_baileys_auth` e `shineray_prisma_data`)
  - Documentação completa de deploy e operação no `README.md` da raiz do repositório

---

# Reconstrução Visual e Interacional (PROMPT 04)

- [x] **ETAPA 01 — Design Tokens**: Cores, superfícies, tipografia, bordas e variáveis CSS completas.
- [x] **ETAPA 02 — App Shell**: Layout 3-colunas estilo WhatsApp Web, adaptação fluida para Desktop/Tablet/Mobile.
- [x] **ETAPA 03 — Navegação**: Barra lateral ultra-compacta (60px), ícones vetoriais, badges de não lidas e automações.
- [x] **ETAPA 04 — Lista de Conversas**: Cards refinados, busca com debounce, pílulas de funil, filtros de lojas e atendentes.
- [x] **ETAPA 05 — Chat**: ChatHeader moderno, status, sincronização, ChatContainer com estado vazio informativo.
- [x] **ETAPA 06 — Mensagens**: Balões de mensagens enviados/recebidos, checks de entrega (✓✓), highlight de busca, agrupamento temporal.
- [x] **ETAPA 07 — Compositor**: Textarea expansível (1 a 5 linhas), Enter para envio, Shift+Enter para quebra, popover de emojis e anexos.
- [x] **ETAPA 08 — Mídia**: Player de áudio com scrubbing e velocidades 1x/1.5x/2x, lightbox para imagens e cards para documentos.
- [x] **ETAPA 09 — Menus e Ações**: Busca in-chat (X de Y), Copilot Drawer lateral com IA real e injeção no compositor.
- [x] **ETAPA 10 — Estados**: ConnectionBanner (Offline, Reconectando, Sincronizando, Erro) e QRCodeScreen moderna com timer e Dark Mode.
- [x] **ETAPA 11 — Painel CRM Contextual**: CRMPanel integrado com cabeçalho, abas e transição suave.
- [x] **ETAPA 12 — Cliente**: CustomerProfile e AssignmentSelector com edição rápida de nome, telefone, filial e vendedor.
- [x] **ETAPA 13 — Funil**: FunnelStepper com avanço visual dos 4 estágios comerciais.
- [x] **ETAPA 14 — Histórico**: TagsManager e NotesSection com histórico e anotações instantâneas.
- [x] **ETAPA 15 — Responsividade**: Validação unificada Mobile, Tablet e Desktop.
- [x] **ETAPA 16 — Dark Mode**: Persistência do tema e validação visual de superfícies.
- [x] **ETAPA 17 — Acessibilidade**: Navegação por teclado, foco visível e atributos ARIA.
- [x] **ETAPA 18 — Microinterações**: Feedback visual tátil de hover, click, envio e cópia.
- [x] **ETAPA 19 — Performance**: Otimização de re-renders e tamanho de bundle.
- [x] **ETAPA 20 — Teste Completo**: Homologação ponta a ponta sem dados simulados.

---

# Estrutura Completa do CRM (PROMPT 05)

- [x] **MIGRATION & BANCO DE DADOS**:
  - Backup preventivo de segurança `backend/prisma/dev.db.bak`.
  - Novos modelos relacionais Prisma: `Company`, `Store`, `Team`, `Role`, `Permission`, `RolePermission`, `UserPermissionException`, `ProductCategory`, `ProductCollection`, `Product`, `CollectionProduct`, `Pipeline`, `PipelineStage`, `LossReason`, `Opportunity`, `Order`, `OrderItem`, `Task`, `Activity`, `QuickReply`, `AuditLog`.
  - Migração executada e sincronizada via Prisma sem perda de mensagens ou chats.

- [x] **EMPRESA MATRIZ & LOJAS / FILIAIS**:
  - Provisionamento da Empresa Matriz ("Shineray do Brasil Montadora de Motocicletas Ltda.") com CNPJ real, endereço e dados corporativos.
  - Endpoints REST `/api/companies/current` e `/api/stores` protegidos por autenticação e RBAC.
  - Interface administrativa completa em `CorporateAdminModal.jsx`.

- [x] **EQUIPES & USUÁRIOS**:
  - Modelo `Team` para setores (Comercial, Atendimento, Pós-venda) com líder e lojas vinculadas.
  - Endpoints REST `/api/teams` e `/api/users`.
  - Gestão e atribuição de colaboradores a cargos, equipes e filiais.

- [x] **CARGOS, PERMISSÕES GRANULARES & ESCOPOS**:
  - Catálogo de 52 permissões canônicas registradas no SQLite.
  - 10 Cargos-base provisionados (`ADMINISTRADOR`, `GESTOR`, `GERENTE`, `SUPERVISOR`, `VENDEDOR`, `ATENDENTE`, `PÓS-VENDA`, `FINANCEIRO`, `MARKETING`, `SUPORTE`).
  - Duplicação de Cargos com clonagem automática de permissões (`POST /api/roles/:id/duplicate`).
  - Matriz de Permissões com seleção de escopo (`OWN`, `TEAM`, `STORE`, `COMPANY`, `ALL`).
  - Precedência rigorosa no backend: `NEGADO EXPLICITAMENTE > EXCEÇÃO ESPECÍFICA > CARGO > EQUIPE > PADRÃO`.
  - Proteção inviolável do Administrador: bloqueio de remoção ou desativação do único administrador ativo.

- [x] **CATÁLOGO DE PRODUTOS & WHATSAPP**:
  - Modelos `ProductCategory`, `ProductCollection` e `Product` com suporte a fotos, preços promocionais e SKU.
  - Endpoints REST de catálogo `/api/categories` e `/api/products`.
  - Envio direto de produto para a conversa do WhatsApp (`POST /api/products/:id/send-whatsapp` via Baileys).
  - Modal `SendProductModal.jsx` acessível no chat ativo (cabeçalho, barra de input e menu de anexos).
  - Modal `CatalogGeneralModal.jsx` para visualização e cadastro de motos na barra lateral.

- [x] **CRM ESTENDIDO, FUNIS, OPORTUNIDADES & PEDIDOS**:
  - Pipeline comercial padrão com 4 etapas e motivos de perda cadastrados.
  - Endpoints REST `/api/pipelines`, `/api/opportunities`, `/api/orders`, `/api/tasks`, `/api/quick-replies`.
  - Trilha de atividades do cliente persistida em `Activity`.

- [x] **AUDITORIA DO SISTEMA**:
  - Trilha de auditoria imutável em `AuditLog` registrando operador, ação, recurso, IP e data/hora.
  - Visualizador de logs com busca e filtros na aba de Auditoria.
