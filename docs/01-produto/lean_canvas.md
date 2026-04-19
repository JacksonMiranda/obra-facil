# 🏗️ Lean Canvas — Obra Fácil

> Marketplace que conecta proprietários de imóveis a profissionais autônomos da construção civil.

---

## 1. 🎯 Segmentos de Mercado

- **Segmento 1 🏠:** Proprietários de imóveis (clientes) — pessoas físicas que precisam de serviços de reforma, manutenção ou construção residencial e buscam profissionais de confiança com agilidade e segurança.
- **Segmento 2 🔧:** Profissionais autônomos da construção civil — pedreiros, eletricistas, pintores e outros trabalhadores que desejam mais visibilidade, clientes recorrentes e uma plataforma para gerenciar seus serviços.

**👤 Early adopters:**
Proprietários de imóveis da classe B/C, entre 35 e 55 anos, já habituados a contratar serviços por aplicativo (Uber, iFood), mas que ainda dependem de indicações informais para encontrar profissionais de obras. Perfil representado pela persona **Carlos Alberto, 45 anos (despachante)** — pouco tempo para pesquisa presencial, inseguro ao receber desconhecidos sem referências sólidas.

**🎯 Perfil do cliente ideal (ICP):**
- 🏘️ Proprietário de imóvel urbano, classe B/C
- 🗓️ Idade entre 35–55 anos
- 📱 Já usa smartphone para serviços do dia a dia
- 🔨 Necessita de reformas pequenas a médias (elétrica, hidráulica, pintura, alvenaria)
- 🔒 Valoriza segurança, transparência de preço e praticidade
- ⏰ Não tem tempo ou rede de contatos para encontrar profissionais confiáveis

---

## 2. ⚠️ Problemas

Principais problemas enfrentados pelo segmento:

1. 😟 **Falta de confiança:** Dificuldade em encontrar profissionais verificados, com histórico comprovado e avaliações reais — o mercado informal gera insegurança ao receber desconhecidos em casa.
2. 💸 **Orçamentos opacos e fragmentados:** O cliente precisa contatar múltiplos profissionais para obter propostas, sem padrão de preço ou clareza sobre o escopo do serviço.

**🔄 Alternativas existentes:**

- 🟡 GetNinjas e Habitissimo (marketplace de serviços genérico, sem integração com materiais)
- 💬 Indicações boca a boca e grupos de WhatsApp (sem verificação, sem rastreabilidade)
- 🔍 Busca no Google/redes sociais (descentralizado, sem garantia de qualidade)

---

## 3. 💡 Solução

Descreva a solução proposta para cada problema:

- **🗺️ Funcionalidade 1 — Busca com perfis verificados:** O cliente encontra profissionais próximos, filtrando por especialidade (pedreiro, eletricista, pintor), nota, portfólio de trabalhos anteriores e disponibilidade — eliminando o risco de contratar um desconhecido sem referências.
- **📋 Funcionalidade 2 — Orçamentos transparentes e agendamento integrado:** O profissional envia uma proposta estruturada com escopo, prazo e valor dentro da plataforma. O cliente agenda a visita técnica diretamente pelo app, com histórico centralizado.

**🚀 MVP (Produto Mínimo Viável):**

- 🔐 Cadastro e autenticação de clientes e profissionais (via Clerk)
- 👷 Perfil do profissional com especialidade, foto, avaliações e geolocalização
- 🔍 Busca de profissionais e categoria de serviço
- 📅 Agendamento de visita técnica
- ⭐ Sistema de avaliação pós-serviço

---

## 4. 💎 Proposta de Valor

Frase clara e objetiva que explique o valor entregue:

> 🏆 **"Encontre o profissional certo para sua reforma, com materiais cotados no mesmo lugar — rápido, seguro e sem surpresas."**

**✨ Diferencial percebido pelo cliente:**

- ✅ Profissionais com portfólio verificado, avaliações reais de outros clientes e histórico de trabalhos — gerando confiança antes mesmo do primeiro contato.

---

## 5. 🛡️ Vantagem Competitiva

O que não pode ser facilmente copiado ou comprado:

- **🏅 Rede de profissionais verificados e avaliados:** A base de dados construída ao longo do tempo, com histórico real de trabalhos e avaliações de clientes, cria uma barreira de entrada difícil de replicar rapidamente.
- **🌐 Efeito de rede (network effects):** Mais profissionais atraem mais clientes, que geram mais avaliações, que atraem mais profissionais — o valor da plataforma cresce exponencialmente com o uso.

---

## 6. 📣 Canais

Como o produto alcança o cliente:

- **📈 Aquisição:** SEO para buscas como "eletricista confiável perto de mim", Google Ads segmentado por cidade/serviço, Instagram e TikTok com conteúdo educativo sobre reformas.
- **📲 Distribuição:** Web app responsivo (PWA) acessível pelo navegador — sem barreira de instalação; app mobile como evolução natural.
- **💻 Canais digitais:** Marketing de conteúdo (dicas de reforma, checklist de contratação), comunidades em grupos do Facebook e WhatsApp de bairro, programa de indicação entre usuários.

---

## 7. 📊 Métricas

Principais indicadores de desempenho (KPIs):

- **📥 Aquisição:** Número de novos cadastros por semana (clientes e profissionais); CAC (Custo de Aquisição de Cliente); tráfego orgânico vs pago.
- **⚡ Ativação:** Taxa de clientes que realizam o primeiro contato com um profissional; taxa de profissionais que completam o perfil com portfólio e disponibilidade.
- **🔁 Retenção:** Taxa de retorno em 30/60/90 dias; número médio de serviços contratados por cliente ao longo de 6 meses; NPS (Net Promoter Score).
- **💰 Receita:** GMV (volume total de serviços intermediados por mês); receita de comissão; ticket médio por serviço.
- **📢 Indicação (Referral):** Taxa de clientes adquiridos por indicação; número de avaliações publicadas por serviço concluído.

**⭐ Métrica norte (North Star Metric):**

- **🏆 Número de serviços concluídos com avaliação positiva (≥ 4 estrelas) por mês** — reflete simultaneamente aquisição, ativação, qualidade e retenção em um único número.

---

## 8. 💳 Estrutura de Despesas

Principais custos:

- **👨‍💻 Desenvolvimento:** Salários ou horas de desenvolvedores (frontend, backend, mobile futuro); ferramentas de design e prototipagem (Stitch/Figma).
- **☁️ Infraestrutura:** Hospedagem Vercel (frontend + backend serverless); Supabase (banco de dados PostgreSQL + storage); Clerk (autenticação); serviços de mapas/geolocalização (Google Maps API).
- **📣 Marketing:** Mídia paga (Google Ads, Meta Ads); produção de conteúdo; SEO e ferramentas de analytics.
- **🛠️ Operacional:** Equipe de suporte ao cliente; processo de verificação e onboarding de profissionais; moderação de avaliações.
- **⚖️ Outros:** Jurídico (termos de uso, LGPD, contratos com parceiros); seguros de responsabilidade civil.

---

## 9. 💵 Fontes de Receita

Modelo de monetização:

- **💸 Comissão:** Percentual sobre o valor de cada serviço fechado pela plataforma (modelo principal). Sem custo para o cliente; o profissional repassa uma taxa sobre o trabalho concluído.
- **⭐ Assinatura:** Plano premium para profissionais com benefícios de destaque na busca, mais fotos no portfólio, badge de verificação avançado e acesso a relatórios de desempenho.
- **📄 Licenciamento:** Licença white-label para redes de lojas de materiais ou franquias de serviços que queiram adotar a plataforma com marca própria (receita futura).
- **📍 Outros:** Destaque patrocinado para profissionais em regiões específicas (modelo de anúncio por localização).

**💰 Preço estimado:**

- Comissão de 10% a 15% sobre o valor do serviço concluído (cobrada do profissional).
- Plano premium para profissionais: R$ 49–R$ 99/mês.
- Comissão de 3% a 5% sobre pedidos de materiais em lojas parceiras.

---

## 🔭 Observações Estratégicas

**🧪 Hipóteses críticas:**

- ✅ Clientes aceitam confiar em profissionais encontrados online se houver avaliações verificadas e portfólio visível.
- ✅ Profissionais autônomos estão dispostos a pagar comissão por clientes recorrentes e qualificados.
- ✅ A integração do módulo de materiais é um diferencial que aumenta a taxa de conversão e o ticket médio.
- ✅ Lojas de materiais enxergam a plataforma como canal de venda complementar, não como concorrente.

**🚨 Riscos principais:**

- **🐔 Chicken-and-egg problem:** Plataforma vazia de profissionais não atrai clientes, e vice-versa — necessário estratégia agressiva de onboarding nos dois lados.
- **⭐ Qualidade do serviço prestado:** Uma má experiência com um profissional descredencia a plataforma — o processo de verificação e as avaliações são críticos desde o MVP.
- **⚔️ Concorrência de players consolidados:** GetNinjas, OLX e Habitissimo têm base de usuários e orçamento de marketing maiores — diferenciação precisa ser clara e comunicada.
- **🔗 Dependência de terceiros:** Clerk, Supabase e Vercel são serviços externos que podem mudar preços ou políticas — monitorar alternativas e planejar portabilidade.

**🧬 Próximos experimentos:**

- 🏙️ Lançar MVP com 10–20 profissionais recrutados manualmente em uma cidade piloto e medir taxa de conversão cliente → contato → serviço agendado.
- 🖥️ Testar landing page com proposta de valor e medir CTR de diferentes mensagens (segurança vs praticidade vs preço).
- 🗣️ Entrevistar 10 proprietários de imóveis para validar os 3 problemas mapeados e o peso de cada um na decisão de contratar.
- 🧱 Testar o módulo de materiais com uma loja parceira antes de escalar a funcionalidade.
