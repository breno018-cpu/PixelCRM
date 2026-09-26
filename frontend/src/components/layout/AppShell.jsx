// frontend/src/components/layout/AppShell.jsx
// Shell Arquitetural de 3 Colunas Inspirado no WhatsApp Web (PROMPT 04 - ETAPA 02)

import React, { useEffect, useState } from 'react';

export default function AppShell({
  navbar,
  sidebar,
  chat,
  crmPanel,
  isCrmOpen = false,
  onCloseCrm,
  activeChat = null,
  onBackToList,
  isDarkMode = false
}) {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1200;
  const isDesktop = windowWidth >= 1200;

  return (
    <div className={`w-full h-screen overflow-hidden flex bg-[var(--app-bg)] select-none font-sans text-[var(--text-primary)] ${isDarkMode ? 'dark' : ''}`}>
      {/* Container Principal com bordas e elevação refinada em telas grandes */}
      <div className="w-full h-full max-w-[1920px] mx-auto flex overflow-hidden shadow-2xl relative bg-[var(--sidebar-bg)]">
        
        {/* 1. NAVEGAÇÃO LATERAL ULTRA-COMPACTA (60px) */}
        {navbar && (
          <aside className="w-[60px] shrink-0 h-full border-r border-[var(--border-light)] bg-[var(--header-bg)] flex flex-col justify-between items-center py-3 z-30 transition-colors duration-200">
            {navbar}
          </aside>
        )}

        {/* 2. ÁREA DE MENSAGERIA PRINCIPAL (LISTA + CHAT + CRM) */}
        <div className="flex-1 flex h-full overflow-hidden relative">
          
          {/* 2.1 COLUNA DE CONVERSAS (Lista de contatos, busca e filtros) */}
          <section
            className={`
              h-full flex flex-col border-r border-[var(--border-light)] bg-[var(--sidebar-bg)] transition-all duration-200 z-20 shrink-0
              ${isMobile
                ? activeChat ? 'hidden' : 'w-full'
                : 'w-[360px] lg:w-[390px] xl:w-[420px]'
              }
            `}
          >
            {sidebar}
          </section>

          {/* 2.2 COLUNA CENTRAL DO CHAT (Mensagens e Compositor) */}
          <main
            className={`
              flex-1 flex flex-col h-full overflow-hidden bg-[var(--chat-bg)] relative z-10
              ${isMobile && !activeChat ? 'hidden' : 'flex'}
            `}
          >
            {chat}
          </main>

          {/* 2.3 COLUNA CONTEXTUAL DO CRM (Cliente, Funil, Tags, Notas) */}
          {crmPanel && (
            <>
              {/* Overlay Backdrop para Tablets e Mobile */}
              {(isMobile || isTablet) && isCrmOpen && (
                <div
                  onClick={onCloseCrm}
                  className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 animate-fade-in transition-opacity"
                  aria-hidden="true"
                />
              )}

              {/* Painel do CRM */}
              <aside
                className={`
                  h-full border-l border-[var(--border-light)] bg-[var(--sidebar-bg)] flex flex-col transition-all duration-300 ease-in-out shrink-0
                  ${isDesktop
                    ? isCrmOpen
                      ? 'w-[360px] xl:w-[390px] opacity-100 z-20'
                      : 'w-0 opacity-0 overflow-hidden border-none pointer-events-none'
                    : isCrmOpen
                    ? 'fixed right-0 top-0 bottom-0 w-[360px] max-w-[90vw] z-50 shadow-2xl'
                    : 'hidden'
                  }
                `}
              >
                {isCrmOpen && crmPanel}
              </aside>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
