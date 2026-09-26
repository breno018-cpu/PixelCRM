// backend/src/aiService.js
// Serviço Real de Inteligência Artificial para Atendimento Comercial (PROMPT 01: Sem Mocks)

/**
 * Executa chamada direta à API do Google Gemini via REST
 */
async function callGeminiApi({ apiKey, model, systemPrompt, prompt, temperature }) {
  const chosenModel = model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt ? `[INSTRUÇÕES DO SISTEMA]:\n${systemPrompt}\n\n` : ''}${prompt}`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: typeof temperature === 'number' ? temperature : 0.7,
      maxOutputTokens: 1000
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'Erro desconhecido na API do Gemini';
    throw new Error(`Falha no Gemini (${response.status}): ${errorMsg}`);
  }

  const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error('A API do Gemini retornou uma resposta vazia ou bloqueada por filtros de segurança.');
  }

  return generatedText.trim();
}

/**
 * Executa chamada direta à API da OpenAI via REST
 */
async function callOpenAiApi({ apiKey, model, systemPrompt, prompt, temperature }) {
  const chosenModel = model || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model: chosenModel,
    messages,
    temperature: typeof temperature === 'number' ? temperature : 0.7,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'Erro desconhecido na API da OpenAI';
    throw new Error(`Falha na OpenAI (${response.status}): ${errorMsg}`);
  }

  const generatedText = data?.choices?.[0]?.message?.content;
  if (!generatedText) {
    throw new Error('A API da OpenAI retornou uma resposta sem conteúdo.');
  }

  return generatedText.trim();
}

/**
 * Testa conectividade e autenticidade da chave de API
 */
export async function testAiConnection({ provider, apiKey, model }) {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    throw new Error('Chave de API não informada.');
  }

  const testPrompt = 'Responda estritamente com a frase: "Conexão validada com sucesso com o Copiloto Comercial."';
  
  if (provider === 'openai') {
    return await callOpenAiApi({
      apiKey: apiKey.trim(),
      model: model || 'gpt-4o-mini',
      prompt: testPrompt,
      temperature: 0.1
    });
  } else {
    // Padrão: gemini
    return await callGeminiApi({
      apiKey: apiKey.trim(),
      model: model || 'gemini-1.5-flash',
      prompt: testPrompt,
      temperature: 0.1
    });
  }
}

/**
 * Gera sugestão comercial do Copiloto baseada no histórico real da conversa
 */
export async function generateCopilotSuggestion({ chat, mode, draftText, config }) {
  const provider = config?.provider || 'gemini';
  const apiKey = (config?.apiKey || '').trim();
  const model = config?.model || (provider === 'openai' ? 'gpt-4o-mini' : 'gemini-1.5-flash');
  const temperature = config?.temperature ?? 0.7;
  const systemPrompt = config?.systemPrompt || 
    'Você é o Copiloto Comercial de Inteligência Artificial da concessionária Shineray Motos. Ajude o atendente a responder os clientes com clareza, simpatia, foco em vendas e informações precisas sobre motos, financiamento, consórcio e test-ride.';

  if (!apiKey) {
    throw new Error('Chave de API de IA não configurada. Acesse as Configurações de IA para registrar sua chave.');
  }

  // Prepara o histórico recente de mensagens (até 15 mensagens mais recentes)
  const recentMessages = (chat.messages || [])
    .slice(-15)
    .map(m => {
      const sender = m.fromMe ? 'Atendente' : (chat.name || 'Cliente');
      const text = m.text || (m.mediaUrl ? '[Mídia/Áudio enviado]' : '');
      return `${sender}: ${text}`;
    })
    .join('\n');

  // Metadados do Lead
  const leadContext = `
Dados do Contato/Lead:
- Nome: ${chat.name || 'Não informado'}
- Telefone/WhatsApp: ${chat.phone || chat.jid}
- Estágio no Funil: ${chat.funnelStage || 'LEAD'}
- Filial: ${chat.store?.name || 'Geral'}
- Atendente Atual: ${chat.assignedUser?.name || 'Não atribuído'}
- Tags de Interesse: ${chat.tags || 'Nenhuma tag'}
- Anotações Internas: ${chat.notes || 'Nenhuma anotação'}
`.trim();

  let prompt = '';

  if (mode === 'improve') {
    if (!draftText || !draftText.trim()) {
      throw new Error('Digite um rascunho de mensagem antes de solicitar a melhoria.');
    }
    prompt = `
${leadContext}

Histórico recente da conversa:
${recentMessages || '(Sem mensagens anteriores)'}

Rascunho atual que o atendente começou a digitar:
"${draftText}"

TAREFA DO COPILOTO:
Reescreva e aperfeiçoe este rascunho de mensagem para o WhatsApp. Torne-o profissional, comercialmente persuasivo, empático, claro e direto ao ponto. Não inclua cabeçalhos, metadados ou explicações, responda APENAS com a mensagem pronta para envio ao cliente.
`.trim();

  } else if (mode === 'summarize') {
    prompt = `
${leadContext}

Histórico completo recente da conversa:
${recentMessages || '(Sem mensagens para resumir)'}

TAREFA DO COPILOTO:
Faça um resumo executivo rápido deste atendimento em formato de tópicos estruturados:
1. Perfil e Interesse do Cliente (modelo de moto desejado, uso pretendido, etc.)
2. Condição Comercial (à vista, financiamento, entrada, consórcio)
3. Objeções ou Dúvidas apresentadas
4. Próxima Ação Comercial Recomendada para o Atendente
Seja conciso, direto e analítico.
`.trim();

  } else {
    // Padrão: mode === 'suggest'
    prompt = `
${leadContext}

Histórico recente da conversa no WhatsApp:
${recentMessages || '(Cliente acabou de entrar em contato)'}

TAREFA DO COPILOTO:
Gere a melhor sugestão de resposta que o atendente deve enviar agora para o cliente no WhatsApp.
Diretrizes:
- Seja caloroso, cordial e comercialmente focado em avançar a negociação (agendar visita à loja, simulação de financiamento ou tirar dúvida da moto).
- Mantenha tom natural de WhatsApp (parágrafos curtos, linguagem brasileira profissional e acolhedora).
- Responda APENAS com o texto da mensagem pronta para ser enviada, sem introduções ou observações extras.
`.trim();
  }

  let resultText = '';
  if (provider === 'openai') {
    resultText = await callOpenAiApi({
      apiKey,
      model,
      systemPrompt,
      prompt,
      temperature
    });
  } else {
    resultText = await callGeminiApi({
      apiKey,
      model,
      systemPrompt,
      prompt,
      temperature
    });
  }

  return {
    success: true,
    suggestion: resultText,
    mode: mode || 'suggest',
    model,
    provider
  };
}
