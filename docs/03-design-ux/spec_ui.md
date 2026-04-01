# Especificação de UI

## Interfaces Gráficas

### INT-01 - Dashboard/Home (Visão Cliente)
- **Tipo de Contêiner:** Página Principal Flow (Mobile First).
- **Campos:** 
  - Barra superior de pesquisa ('Encontre um encanador, pedreiro...').
- **Botões:** 
  - Grid de Ícones de Serviços Rápidos (Reparos elétricos, Instalações Hidráulicas, Pinturas, Diaristas).
  - Floating Action Button para suporte ou emergência.
- **Links:** 
  - "Ver todos os serviços".
- **Considerações:** A Home deve ser extremamente limpa usando princípios do Flat Design, destacando os "Profissionais super bem avaliados perto de você" em formato de carrossel de Cards para criar "Prova Social" imediata e confiança pro usuário Carlos Alberto (nossa persona). 

### INT-02 - Perfil Completo do Profissional
- **Tipo de Contêiner:** Página de Detalhe.
- **Campos:** 
  - Apenas labels textuais (Foto grande e nítida, Nome, Profissão, Nota Média Gigante (4.9/5), Quantidade de Trabalhos Realizados e "Review" em destaque).
- **Botões:** 
  - Principal (Call to Action Primário): "Conversar e Solicitar Visita/Orçamento".
  - Secundário: "Compartilhar Perfil".
- **Links:** 
  - "Ler todos os 142 comentários".
- **Considerações:** Foco na credibilidade. Informações dispostas com priorização vertical (Top: Foto e Nome; Meio: Nota e Especialidades; Bottom: CTA Fixado no rodapé da tela para fácil engajamento manual).

### INT-03 - Chat de Serviço
- **Tipo de Contêiner:** Container de Mensageria (Tela cheia + Teclado nativo).
- **Campos:** 
  - Input área de digitação dinâmica.
- **Botões:** 
  - "Enviar Foto".
  - "Enviar Áudio".
  - Botão de Ação Flutuante/Injetado no chat (Visão Profissional): "Criar e Enviar Lista de Materiais".
- **Links:** N/A
- **Considerações:** Comportamento muito similar a apps correntes de mercado como WhatsApp para garantir "Zero Curva de Aprendizado". Aqui, os orçamentos e Listas de Material são gerados "dentro" do chat.

### INT-04 - Análise e Cotação de Materiais Automática
- **Tipo de Contêiner:** Tela de Checkout/Carrinho Comparativo.
- **Campos:** N/A (Consumo dinâmico da cesta elaborada via INT-03).
- **Botões:** 
  - Seleção em rádio nas "Top 3 Melhores Ofertas Locais" geradas pelas Lojas.
  - "Confirmar e Ir Para o Pagamento".
- **Links:** 
  - "Revisar/Editar Itens Pescados (Aviso de alteração do orçamento do construtor)".
- **Considerações:** Uma tela de forte apelo de "economia", exibindo "Você está economizando X reais na loja Y" de forma explícita. O apelo visual de redução de custo na dor do Carlos Alberto se materializa nessa janela em específico.

---

## Fluxo de Navegação
1. **Descoberta:** O cliente entra (INT-01), efetua a busca filtrando pelo serviço e chega ao carrossel de resultados de Profissionais mais bem rankeados.
2. **Avaliação Pessoal:** Ele entra em INT-02 para auditar os reviews, fotos de trabalhos e ter a garantia de qualidade (removendo a "falta de confiança" relatada nas Dores).
3. **Comunicação:** Ao apertar o CTA, ele prossegue para INT-03 (Chat) onde expõe o estrago na casa ou a obra a ser feita para o profissional.
4. **Resolução/Geração de Valor:** O profissional entende o serviço, aprova agenda, e lança pelo próprio chat a "Lista de Compras". Assim que enviada, o sistema redireciona o cliente Carlos Alberto para a INT-04 (Cotação Automática), onde ele apenas aperta o botão de confirmar o parcelamento do conjunto Loja+Obreiro num único tap.

---

## Diretrizes para IA
- Respeitar estritamente a arquitetura de informação focada em Hierarquia Visual e Acessibilidade (fontes mais robustas). 
- Utilize o esquema de cores semântico em frameworks/protótipos para que Erros sejam Vermelhos/Soft (#EF4444) e Boas Práticas Economizadas ou Botões Sigam Tons Confidenciais e Seguros como Azuis Escuros (#1e40af) ou Verdes Brandos (#10b981).
- Toda tela que exige decisão do usuário deve ter seus CTAs colados à margem inferior visando ergonomia para Mobile.
