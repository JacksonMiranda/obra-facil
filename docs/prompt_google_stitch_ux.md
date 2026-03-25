# Prompt para Designer de UX - Google Stitch

**Atue como um Designer de UX Sênior.** 

Sua tarefa é utilizar a ferramenta de prototipagem (como o Google Stitch) para gerar templates de protótipos de alta fidelidade para a nossa nova plataforma chamada **"Obra Fácil"**.

Siga estritamente as restrições e guias abaixo inspirados na documentação do nosso produto (Definição de Problema, PRD e Especificação de UI).

## 1. Contexto do Projeto e Persona
- **Produto:** Obra Fácil - um aplicativo "all-in-one" que conecta clientes, profissionais da área de construção e lojas de materiais locais.
- **Público-Alvo Principal:** Carlos Alberto, 45 anos, despachante. Não possui conhecimento técnico, tem pouco tempo e busca segurança/confiança antes de pagar por serviços/materiais.
- **Objetivo da UI:** Garantir credibilidade, reduzir a ansiedade do usuário, transmitir segurança e propor uma curva de aprendizado quase zero.
- **Acessibilidade:** Alta legibilidade (fontes robustas e limpas) e alto contraste para o perfil etário 45+ (Ex: Fonte _Inter_, pesos Medium/Semi-bold).
- **Esquema de Cores:** Confiança e sucesso. Usar tons de Azul Escuro (#1E40AF) para segurança/confidencialidade, Vermelho/Soft (#EF4444) para erros e Verde Brando (#10B981) para economia e boas práticas.
- **Layout:** Mobile-First (Flat Design limpo), com todos os CTAs (Call to Actions) fixados na margem inferior da tela para facilitar a ergonomia.

## 2. Telas a Serem Prototipadas

Por favor, crie as seguintes telas com estas especificações exatas:

### Tela 1: INT-01 - Dashboard/Home (Visão Cliente)
- **Cabeçalho:** Barra superior de pesquisa ("Encontre um encanador, pedreiro...").
- **Corpo Principal:** 
  - Grid de Ícones de Serviços Rápidos (Ex: Reparos elétricos, Instalações Hidráulicas, Pinturas).
  - Link "Ver todos os serviços".
  - Seção de destaque: Carrossel com Cards de "Profissionais super bem avaliados perto de você" (Prova social imediata).
- **Ações:** Floating Action Button (FAB) aparente para suporte ou emergências.

### Tela 2: INT-02 - Perfil Completo do Profissional
- **Hierarquia Visual Vertical:**
  - **Topo:** Foto grande, nítida e com aparência profissional, Nome do profissional.
  - **Meio:** Profissão principal, Nota Média Gigante (ex: 4.9/5), Quantidade de Trabalhos Realizados.
  - **Destaque:** Seção de "Reviews" (Avaliações recentes) com o link "Ler todos os comentários".
- **Ações:** 
  - CTA Primário fixado no rodapé: "Conversar e Solicitar Visita/Orçamento".
  - Botão Secundário: "Compartilhar Perfil".

### Tela 3: INT-03 - Chat de Serviço
- **Estilo:** Similar ao WhatsApp (Zero curva de aprendizado).
- **Componentes:** 
  - Container de Mensageria ocupando a tela cheia.
  - Área de digitação dinâmica no inferior, acima do teclado nativo.
  - Botões para "Enviar Foto" e "Enviar Áudio".
- **Visão do Profissional (Simulação):** Incluir um botão injetado no chat: "Criar e Enviar Lista de Materiais".

### Tela 4: INT-04 - Análise e Cotação de Materiais Automática
- **Visão Geral:** Tela de Checkout/Carrinho Comparativo. A tela de maior apelo à dor da persona (economia e praticidade).
- **Componentes:**
  - Consumo dinâmico da "Lista de Materiais Exigida" criada no chat.
  - Escolha via rádio (Radio buttons) das "Top 3 Melhores Ofertas Locais" de lojas da região.
  - Frase de apelo explícita: "Você está economizando X reais na loja Y" ou um selo "Maior Economia!".
  - Link útil para "Revisar/Editar Itens Pescados".
- **Ações:** CTA final no rodapé: "Confirmar e Ir Para o Pagamento" / "Aprovar Serviço & Comprar Materiais".

---

**Instrução à Ferramenta:** Ao gerar o código (ou prompt de imagem) correspondente para estas 4 telas, certifique-se de que a navegação pareça contínua (Descoberta -> Avaliação de Perfil -> Chat -> Cotação/Checkout) e que as diretrizes visuais mitiguem totalmente a falta de tempo e insegurança do usuário.