import { prisma } from './db.js';

// Catálogo canônico de recursos e ações de permissão
export const SYSTEM_PERMISSIONS = [
  // Empresas e Filiais
  { id: 'COMPANIES_VIEW', resource: 'COMPANIES', action: 'VIEW', description: 'Visualizar dados da empresa' },
  { id: 'COMPANIES_EDIT', resource: 'COMPANIES', action: 'EDIT', description: 'Editar dados corporativos da empresa' },
  { id: 'STORES_VIEW', resource: 'STORES', action: 'VIEW', description: 'Visualizar filiais e lojas' },
  { id: 'STORES_CREATE', resource: 'STORES', action: 'CREATE', description: 'Criar novas filiais' },
  { id: 'STORES_EDIT', resource: 'STORES', action: 'EDIT', description: 'Editar informações de filiais' },
  { id: 'STORES_DELETE', resource: 'STORES', action: 'DELETE', description: 'Excluir ou desativar filiais' },

  // Equipes
  { id: 'TEAMS_VIEW', resource: 'TEAMS', action: 'VIEW', description: 'Visualizar equipes e setores' },
  { id: 'TEAMS_CREATE', resource: 'TEAMS', action: 'CREATE', description: 'Criar novas equipes' },
  { id: 'TEAMS_EDIT', resource: 'TEAMS', action: 'EDIT', description: 'Editar equipes e membros' },
  { id: 'TEAMS_DELETE', resource: 'TEAMS', action: 'DELETE', description: 'Arquivar ou excluir equipes' },

  // Usuários e Cargos
  { id: 'USERS_VIEW', resource: 'USERS', action: 'VIEW', description: 'Visualizar lista de usuários' },
  { id: 'USERS_CREATE', resource: 'USERS', action: 'CREATE', description: 'Cadastrar novos operadores e usuários' },
  { id: 'USERS_EDIT', resource: 'USERS', action: 'EDIT', description: 'Editar dados e status de usuários' },
  { id: 'USERS_DELETE', resource: 'USERS', action: 'DELETE', description: 'Desativar ou remover usuários' },
  { id: 'ROLES_VIEW', resource: 'ROLES', action: 'VIEW', description: 'Visualizar cargos e permissões' },
  { id: 'ROLES_CREATE', resource: 'ROLES', action: 'CREATE', description: 'Criar novos cargos e perfis' },
  { id: 'ROLES_EDIT', resource: 'ROLES', action: 'EDIT', description: 'Editar cargos e matriz de permissões' },
  { id: 'ROLES_DELETE', resource: 'ROLES', action: 'DELETE', description: 'Arquivar ou remover cargos' },

  // WhatsApp e Atendimento
  { id: 'WHATSAPP_VIEW', resource: 'WHATSAPP', action: 'VIEW', description: 'Visualizar status da conexão do WhatsApp' },
  { id: 'WHATSAPP_ADMIN', resource: 'WHATSAPP', action: 'ADMIN', description: 'Conectar, desconectar ou resetar WhatsApp' },
  { id: 'CHATS_VIEW', resource: 'CHATS', action: 'VIEW', description: 'Visualizar conversas e contatos' },
  { id: 'CHATS_ASSIGN', resource: 'CHATS', action: 'ASSIGN', description: 'Transferir ou atribuir conversas a atendentes' },
  { id: 'CHATS_DELETE', resource: 'CHATS', action: 'DELETE', description: 'Arquivar ou excluir conversas' },
  { id: 'MESSAGES_VIEW', resource: 'MESSAGES', action: 'VIEW', description: 'Ler mensagens trocadas' },
  { id: 'MESSAGES_SEND', resource: 'MESSAGES', action: 'CREATE', description: 'Enviar mensagens de texto, áudio e mídias' },

  // CRM, Funil e Oportunidades
  { id: 'CRM_VIEW', resource: 'CRM', action: 'VIEW', description: 'Acessar ficha cadastral do cliente e tags' },
  { id: 'CRM_EDIT', resource: 'CRM', action: 'EDIT', description: 'Editar dados cadastrais, notas e tags do cliente' },
  { id: 'PIPELINES_VIEW', resource: 'PIPELINES', action: 'VIEW', description: 'Visualizar funis e quadro Kanban' },
  { id: 'PIPELINES_ADMIN', resource: 'PIPELINES', action: 'ADMIN', description: 'Criar e editar etapas dos funis comerciais' },
  { id: 'OPPORTUNITIES_VIEW', resource: 'OPPORTUNITIES', action: 'VIEW', description: 'Visualizar oportunidades comerciais' },
  { id: 'OPPORTUNITIES_CREATE', resource: 'OPPORTUNITIES', action: 'CREATE', description: 'Abrir novas oportunidades de venda' },
  { id: 'OPPORTUNITIES_EDIT', resource: 'OPPORTUNITIES', action: 'EDIT', description: 'Editar valor, etapa e status da oportunidade' },
  { id: 'OPPORTUNITIES_DELETE', resource: 'OPPORTUNITIES', action: 'DELETE', description: 'Excluir ou marcar perda de oportunidades' },

  // Catálogo e Produtos
  { id: 'CATALOG_VIEW', resource: 'CATALOG', action: 'VIEW', description: 'Visualizar catálogo de produtos' },
  { id: 'CATALOG_SEND', resource: 'CATALOG', action: 'SHARE', description: 'Enviar card de produto ao cliente no chat' },
  { id: 'PRODUCTS_CREATE', resource: 'PRODUCTS', action: 'CREATE', description: 'Cadastrar novos produtos no catálogo' },
  { id: 'PRODUCTS_EDIT', resource: 'PRODUCTS', action: 'EDIT', description: 'Editar preços, estoque e fotos de produtos' },
  { id: 'PRODUCTS_DELETE', resource: 'PRODUCTS', action: 'DELETE', description: 'Arquivar ou excluir produtos do catálogo' },

  // Pedidos Comerciais
  { id: 'ORDERS_VIEW', resource: 'ORDERS', action: 'VIEW', description: 'Visualizar pedidos e cotações' },
  { id: 'ORDERS_CREATE', resource: 'ORDERS', action: 'CREATE', description: 'Criar pedidos comerciais para clientes' },
  { id: 'ORDERS_EDIT', resource: 'ORDERS', action: 'EDIT', description: 'Atualizar status e itens de pedidos' },

  // Tarefas e Linha do Tempo
  { id: 'TASKS_VIEW', resource: 'TASKS', action: 'VIEW', description: 'Visualizar tarefas e lembretes de atendimento' },
  { id: 'TASKS_CREATE', resource: 'TASKS', action: 'CREATE', description: 'Criar novas tarefas de retorno para a equipe' },
  { id: 'TASKS_EDIT', resource: 'TASKS', action: 'EDIT', description: 'Concluir ou reagendar tarefas' },
  { id: 'ACTIVITIES_VIEW', resource: 'ACTIVITIES', action: 'VIEW', description: 'Visualizar histórico e linha do tempo do cliente' },

  // Automações, IA e Campanhas
  { id: 'AUTOMATIONS_ADMIN', resource: 'AUTOMATIONS', action: 'ADMIN', description: 'Configurar regras e horários de automação' },
  { id: 'AI_ADMIN', resource: 'AI', action: 'ADMIN', description: 'Configurar credenciais e prompts do Copiloto de IA' },
  { id: 'AI_USE', resource: 'AI', action: 'VIEW', description: 'Utilizar sugestões e resumos do Copiloto de IA' },

  // Relatórios, Dashboard e Auditoria
  { id: 'DASHBOARD_VIEW', resource: 'DASHBOARD', action: 'VIEW', description: 'Acessar indicadores do Dashboard executivo' },
  { id: 'REPORTS_VIEW', resource: 'REPORTS', action: 'VIEW', description: 'Gerar relatórios de atendimento e conversão' },
  { id: 'REPORTS_EXPORT', resource: 'REPORTS', action: 'EXPORT', description: 'Exportar relatórios em planilhas ou PDF' },
  { id: 'AUDIT_VIEW', resource: 'AUDIT', action: 'VIEW', description: 'Visualizar registros e trilha de auditoria do sistema' }
];

// Presets dos 10 cargos corporativos iniciais
export const BASE_ROLES = [
  {
    name: 'ADMINISTRADOR',
    description: 'Acesso pleno irrestrito a todas as funcionalidades corporativas e configurações da plataforma.',
    scope: 'ALL',
    isSystem: true,
    allPermissions: true
  },
  {
    name: 'GESTOR',
    description: 'Gestão executiva da empresa, visualização ampla de relatórios, funis, catálogo e auditoria.',
    scope: 'COMPANY',
    isSystem: true,
    permissions: [
      'COMPANIES_VIEW', 'STORES_VIEW', 'TEAMS_VIEW', 'USERS_VIEW', 'ROLES_VIEW',
      'WHATSAPP_VIEW', 'CHATS_VIEW', 'MESSAGES_VIEW', 'CRM_VIEW', 'PIPELINES_VIEW',
      'OPPORTUNITIES_VIEW', 'CATALOG_VIEW', 'ORDERS_VIEW', 'TASKS_VIEW', 'ACTIVITIES_VIEW',
      'AI_USE', 'DASHBOARD_VIEW', 'REPORTS_VIEW', 'REPORTS_EXPORT', 'AUDIT_VIEW'
    ]
  },
  {
    name: 'GERENTE',
    description: 'Gestão da loja e equipe, distribuição de leads, supervisão de vendas e aprovação de pedidos.',
    scope: 'STORE',
    isSystem: true,
    permissions: [
      'STORES_VIEW', 'TEAMS_VIEW', 'USERS_VIEW', 'WHATSAPP_VIEW',
      'CHATS_VIEW', 'CHATS_ASSIGN', 'MESSAGES_VIEW', 'MESSAGES_SEND',
      'CRM_VIEW', 'CRM_EDIT', 'PIPELINES_VIEW', 'OPPORTUNITIES_VIEW', 'OPPORTUNITIES_CREATE', 'OPPORTUNITIES_EDIT',
      'CATALOG_VIEW', 'CATALOG_SEND', 'ORDERS_VIEW', 'ORDERS_CREATE', 'ORDERS_EDIT',
      'TASKS_VIEW', 'TASKS_CREATE', 'TASKS_EDIT', 'ACTIVITIES_VIEW',
      'AI_USE', 'DASHBOARD_VIEW', 'REPORTS_VIEW'
    ]
  },
  {
    name: 'SUPERVISOR',
    description: 'Supervisão direta dos atendimentos e oportunidades da equipe.',
    scope: 'TEAM',
    isSystem: true,
    permissions: [
      'TEAMS_VIEW', 'CHATS_VIEW', 'CHATS_ASSIGN', 'MESSAGES_VIEW', 'MESSAGES_SEND',
      'CRM_VIEW', 'CRM_EDIT', 'PIPELINES_VIEW', 'OPPORTUNITIES_VIEW', 'OPPORTUNITIES_CREATE', 'OPPORTUNITIES_EDIT',
      'CATALOG_VIEW', 'CATALOG_SEND', 'ORDERS_VIEW', 'TASKS_VIEW', 'TASKS_CREATE', 'TASKS_EDIT', 'ACTIVITIES_VIEW',
      'AI_USE', 'DASHBOARD_VIEW'
    ]
  },
  {
    name: 'VENDEDOR',
    description: 'Atendimento comercial, envio de mensagens, apresentação do catálogo e gestão das próprias oportunidades.',
    scope: 'OWN',
    isSystem: true,
    permissions: [
      'CHATS_VIEW', 'MESSAGES_VIEW', 'MESSAGES_SEND',
      'CRM_VIEW', 'CRM_EDIT', 'PIPELINES_VIEW', 'OPPORTUNITIES_VIEW', 'OPPORTUNITIES_CREATE', 'OPPORTUNITIES_EDIT',
      'CATALOG_VIEW', 'CATALOG_SEND', 'ORDERS_VIEW', 'ORDERS_CREATE',
      'TASKS_VIEW', 'TASKS_CREATE', 'TASKS_EDIT', 'ACTIVITIES_VIEW', 'AI_USE'
    ]
  },
  {
    name: 'ATENDENTE',
    description: 'Recepção, qualificação inicial de leads e transferência para consultores comerciais.',
    scope: 'OWN',
    isSystem: true,
    permissions: [
      'CHATS_VIEW', 'CHATS_ASSIGN', 'MESSAGES_VIEW', 'MESSAGES_SEND',
      'CRM_VIEW', 'CRM_EDIT', 'PIPELINES_VIEW', 'CATALOG_VIEW', 'CATALOG_SEND',
      'TASKS_VIEW', 'TASKS_CREATE', 'ACTIVITIES_VIEW', 'AI_USE'
    ]
  },
  {
    name: 'PÓS-VENDA',
    description: 'Acompanhamento da entrega, satisfação do cliente e revisões de motos.',
    scope: 'STORE',
    isSystem: true,
    permissions: [
      'CHATS_VIEW', 'MESSAGES_VIEW', 'MESSAGES_SEND',
      'CRM_VIEW', 'CRM_EDIT', 'PIPELINES_VIEW', 'ORDERS_VIEW',
      'TASKS_VIEW', 'TASKS_CREATE', 'TASKS_EDIT', 'ACTIVITIES_VIEW'
    ]
  },
  {
    name: 'FINANCEIRO',
    description: 'Acompanhamento de propostas aprovadas, faturamento e contratos fechados.',
    scope: 'COMPANY',
    isSystem: true,
    permissions: [
      'CHATS_VIEW', 'MESSAGES_VIEW', 'CRM_VIEW', 'PIPELINES_VIEW',
      'OPPORTUNITIES_VIEW', 'ORDERS_VIEW', 'ORDERS_EDIT', 'REPORTS_VIEW', 'REPORTS_EXPORT'
    ]
  },
  {
    name: 'MARKETING',
    description: 'Gestão de campanhas, catálogo de produtos, fotos e métricas de conversão de leads.',
    scope: 'COMPANY',
    isSystem: true,
    permissions: [
      'CHATS_VIEW', 'MESSAGES_VIEW', 'CRM_VIEW', 'PIPELINES_VIEW',
      'CATALOG_VIEW', 'PRODUCTS_CREATE', 'PRODUCTS_EDIT', 'PRODUCTS_DELETE',
      'DASHBOARD_VIEW', 'REPORTS_VIEW', 'REPORTS_EXPORT'
    ]
  },
  {
    name: 'SUPORTE',
    description: 'Atendimento operacional e suporte interno a processos e clientes.',
    scope: 'COMPANY',
    isSystem: true,
    permissions: [
      'CHATS_VIEW', 'MESSAGES_VIEW', 'MESSAGES_SEND',
      'CRM_VIEW', 'TASKS_VIEW', 'TASKS_CREATE', 'ACTIVITIES_VIEW'
    ]
  }
];

export async function initPrompt05Structure() {
  console.log('[PROMPT 05] Inicializando estrutura corporativa e governança no banco...');

  // 1. Garantir Empresa Matriz
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Shineray do Brasil',
        tradeName: 'Shineray Motos Brasil',
        legalName: 'Shineray do Brasil Montadora de Motocicletas Ltda.',
        cnpj: '07.382.493/0001-08',
        phone: '+55 81 3301-4000',
        email: 'contato@shineray.com.br',
        address: 'Rodovia PE-60, Complexo Industrial de Suape',
        city: 'Cabo de Santo Agostinho',
        state: 'PE',
        country: 'Brasil',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        status: 'ACTIVE'
      }
    });
    console.log('[PROMPT 05] Empresa Matriz provisionada:', company.name, `(${company.id})`);
  } else {
    console.log('[PROMPT 05] Empresa Matriz já existente:', company.name);
  }

  // 2. Atualizar Lojas e Usuários órfãos com a empresa padrão
  const storesUpdated = await prisma.store.updateMany({
    where: { companyId: null },
    data: { companyId: company.id }
  });
  if (storesUpdated.count > 0) {
    console.log(`[PROMPT 05] ${storesUpdated.count} lojas associadas à empresa matriz.`);
  }

  const usersUpdated = await prisma.user.updateMany({
    where: { companyId: null },
    data: { companyId: company.id }
  });
  if (usersUpdated.count > 0) {
    console.log(`[PROMPT 05] ${usersUpdated.count} usuários associados à empresa matriz.`);
  }

  // 3. Cadastrar Permissões Canônicas no banco
  for (const perm of SYSTEM_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { id: perm.id },
      update: { description: perm.description, resource: perm.resource, action: perm.action },
      create: { id: perm.id, resource: perm.resource, action: perm.action, description: perm.description }
    });
  }
  console.log(`[PROMPT 05] ${SYSTEM_PERMISSIONS.length} permissões canônicas registradas.`);

  // 4. Cadastrar os 10 Cargos-Base e vincular Permissões
  const allPerms = await prisma.permission.findMany();
  for (const roleDef of BASE_ROLES) {
    let role = await prisma.role.findFirst({
      where: { companyId: company.id, name: roleDef.name }
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          companyId: company.id,
          name: roleDef.name,
          description: roleDef.description,
          scope: roleDef.scope,
          isSystem: roleDef.isSystem,
          status: 'ACTIVE'
        }
      });
      console.log(`[PROMPT 05] Cargo criado: ${role.name}`);
    }

    // Vincular permissões ao cargo
    const permsToAssign = roleDef.allPermissions
      ? allPerms
      : allPerms.filter(p => (roleDef.permissions || []).includes(p.id));

    for (const p of permsToAssign) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: p.id }
        },
        update: { scope: roleDef.scope, granted: true },
        create: {
          roleId: role.id,
          permissionId: p.id,
          scope: roleDef.scope,
          granted: true
        }
      });
    }
  }
  console.log(`[PROMPT 05] Todos os 10 cargos e matrizes de permissões configurados com sucesso.`);

  // 5. Vincular usuários existentes aos seus cargos correspondentes
  const adminRole = await prisma.role.findFirst({ where: { companyId: company.id, name: 'ADMINISTRADOR' } });
  const operatorRole = await prisma.role.findFirst({ where: { companyId: company.id, name: 'VENDEDOR' } });

  if (adminRole) {
    await prisma.user.updateMany({
      where: { role: 'ADMIN', roleId: null },
      data: { roleId: adminRole.id }
    });
  }
  if (operatorRole) {
    await prisma.user.updateMany({
      where: { role: 'OPERATOR', roleId: null },
      data: { roleId: operatorRole.id }
    });
  }

  // 6. Garantir Pipeline Padrão e Etapas Comerciais
  let defaultPipeline = await prisma.pipeline.findFirst({ where: { companyId: company.id, isDefault: true } });
  if (!defaultPipeline) {
    defaultPipeline = await prisma.pipeline.create({
      data: {
        companyId: company.id,
        name: 'Funil Comercial Shineray',
        isDefault: true,
        stages: {
          create: [
            { name: 'Leads', orderIndex: 0, color: '#3B82F6', winProbability: 10.0 },
            { name: 'Em Negociação', orderIndex: 1, color: '#EAB308', winProbability: 35.0 },
            { name: 'Proposta Enviada', orderIndex: 2, color: '#F97316', winProbability: 70.0 },
            { name: 'Contrato Fechado', orderIndex: 3, color: '#10B981', winProbability: 100.0 }
          ]
        }
      }
    });
    console.log('[PROMPT 05] Funil Comercial Padrão com 4 etapas provisionado.');
  }

  // 7. Motivos de Perda Padrão
  const standardLossReasons = [
    'Preço elevado',
    'Financiamento reprovado',
    'Optou por concorrente',
    'Desistência da compra',
    'Sem interesse no momento',
    'Contato sem retorno',
    'Modelo/cor indisponível',
    'Outro motivo'
  ];

  for (const reasonName of standardLossReasons) {
    const exists = await prisma.lossReason.findFirst({
      where: { companyId: company.id, name: reasonName }
    });
    if (!exists) {
      await prisma.lossReason.create({
        data: { companyId: company.id, name: reasonName }
      });
    }
  }

  // 8. Registrar log de auditoria da inicialização
  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      action: 'CREATE',
      resource: 'SYSTEM',
      details: JSON.stringify({
        event: 'PROMPT_05_INITIALIZED',
        company: company.name,
        permissionsCount: SYSTEM_PERMISSIONS.length,
        rolesCount: BASE_ROLES.length
      })
    }
  });

  console.log('[PROMPT 05] Inicialização estrutural concluída com êxito!');
}

// Se executado diretamente via terminal
if (process.argv[1]?.endsWith('initPrompt05.js')) {
  initPrompt05Structure()
    .then(() => {
      console.log('Script finalizado com sucesso.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro na inicialização:', err);
      process.exit(1);
    });
}
