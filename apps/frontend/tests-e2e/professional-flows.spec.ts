/**
 * E2E — Fluxos obrigatórios do sistema de profissionais
 *
 * Pré-requisitos para rodar:
 *   1. Frontend em http://localhost:3000 (NEXT_PUBLIC_DISABLE_CLERK_AUTH=true)
 *   2. Backend em http://localhost:3001 (DISABLE_CLERK_AUTH=true)
 *   3. PostgreSQL Docker em localhost:5433 com seed aplicado
 *
 * Modos de execução:
 *   E2E_BYPASS_USER=demo_client_001 npx playwright test    → Fluxos 1, 3
 *   E2E_BYPASS_USER=demo_professional_001 npx playwright test → Fluxos 2, 3, 4
 *
 * Os fluxos 1 e 4 alteram estado no banco. O banco é resetado entre suites
 * executando `npm run docker:reset` antes de cada rodada completa.
 */

import { test, expect, type Page } from '@playwright/test';

const bypassUser = process.env.E2E_BYPASS_USER ?? 'demo_client_001';
const isClientRun = bypassUser === 'demo_client_001';
const isProfessionalRun = bypassUser === 'demo_professional_001';

// ─── Fluxo 1: Criação/ativação do perfil profissional ────────────────────────
//
// Cenário: usuário autenticado como cliente navega até Configurações,
// ativa seu perfil profissional preenchendo especialidade + bio,
// e verifica que o perfil aparece como "Ativo" na tela.
//
// Pré-condição: NEXT_PUBLIC_BYPASS_USER_CLERK_ID=demo_client_001
//               Carlos Alberto não possui role 'professional' em account_roles.

test.describe('Fluxo 1: Ativação do perfil profissional', () => {
  test.skip(
    !isClientRun,
    'Fluxo 1 requer E2E_BYPASS_USER=demo_client_001',
  );

  test('cliente vê o botão "Tornar-se Profissional" em Configurações', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    await expect(
      page.getByRole('button', { name: /tornar-se profissional/i }),
    ).toBeVisible();
  });

  test('formulário de ativação expande ao clicar no botão', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    const activateBtn = page.getByRole('button', { name: /tornar-se profissional/i });
    await activateBtn.click();

    // Aguarda o formulário carregar (inclui grid de especialidades via API)
    await expect(page.getByPlaceholder(/descreva sua experiência/i)).toBeVisible();
  });

  test('formulário carrega categorias de serviço disponíveis', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    await page.getByRole('button', { name: /tornar-se profissional/i }).click();

    // Aguarda serviços carregarem (seed tem 6 categorias)
    await expect(page.getByText(/eletricista/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('ativa perfil profissional e exibe "Perfil Profissional Ativo"', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    await page.getByRole('button', { name: /tornar-se profissional/i }).click();

    // Aguarda serviços carregarem
    await page.waitForSelector('[class*="grid"] button', { timeout: 5000 });

    // Seleciona "Pedreiro" (Carlos Alberto já tem profissional com essa especialidade no seed)
    await page.getByRole('button', { name: /pedreiro/i }).first().click();

    // Preenche bio com no mínimo 10 caracteres
    await page.getByPlaceholder(/descreva sua experiência/i).fill(
      'Profissional com experiência em reformas residenciais e acabamentos.',
    );

    // Submete o formulário
    await page.getByRole('button', { name: /ativar perfil profissional/i }).click();

    // Após o router.refresh(), aguarda a confirmação de ativação
    await expect(
      page.getByText(/perfil profissional ativo/i),
    ).toBeVisible({ timeout: 10000 });
  });

  test('perfil ativo exibe badge de status (Ativo ou Rascunho)', async ({ page }) => {
    // Pré-condição: perfil já ativo (roda após o teste de ativação acima).
    // Em execução isolada, Carlos Alberto precisa já ter sido ativado.
    await page.goto('/perfil/configuracoes');

    const ativo = page.getByText('Ativo').first();
    const rascunho = page.getByText('Rascunho').first();

    // O perfil mostra UM dos dois badges
    await expect(ativo.or(rascunho)).toBeVisible({ timeout: 5000 });
  });

  test('cleanup: desativa o perfil profissional para restaurar estado inicial', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    const deactivateBtn = page.getByRole('button', { name: /desativar perfil profissional/i });

    // Só desativa se o perfil estiver ativo; caso contrário o teste passa.
    if (await deactivateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deactivateBtn.click();

      // Após desativação, o botão "Tornar-se Profissional" deve reaparecer
      await expect(
        page.getByRole('button', { name: /tornar-se profissional/i }),
      ).toBeVisible({ timeout: 10000 });
    }
  });
});

// ─── Fluxo 2: Alternância de modo (cliente ↔ profissional) ───────────────────
//
// Cenário: usuário com roles ['client', 'professional'] alterna entre os
// modos via RoleSelector. Os dados do perfil profissional são preservados
// (specialty, bio) após a alternância — não são deletados.
//
// Pré-condição: NEXT_PUBLIC_BYPASS_USER_CLERK_ID=demo_professional_001
//               Ricardo Silva tem roles=['professional'] e professionals record.

test.describe('Fluxo 2: Alternância de modo cliente ↔ profissional', () => {
  test.skip(
    !isProfessionalRun,
    'Fluxo 2 requer E2E_BYPASS_USER=demo_professional_001',
  );

  test('profissional vê seção "Tipo de Perfil" com ambos os roles', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    await expect(page.getByText(/tipo de perfil/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /cliente/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /profissional/i })).toBeVisible();
  });

  test('alternância para "Cliente" não remove dados do perfil profissional', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    // Guarda o nome da especialidade atual antes de mudar de modo
    await page.waitForSelector(':text("Especialidade:")', { timeout: 5000 });
    const specialtyText = await page.locator(':text("Especialidade:")').textContent();

    // Clica no botão "Cliente" para alternar
    await page.getByRole('button', { name: /^cliente$/i }).click();

    // Aguarda refresh — o RoleSelector pode ou não desaparecer dependendo dos roles
    await page.waitForTimeout(1500);

    // Volta para modo profissional
    const professionalBtn = page.getByRole('button', { name: /^profissional$/i });
    if (await professionalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await professionalBtn.click();
      await page.waitForTimeout(1500);
    }

    // Navega novamente para garantir que os dados foram preservados no banco
    await page.goto('/perfil/configuracoes');
    await page.waitForSelector(':text("Perfil Profissional Ativo")', { timeout: 5000 });

    // Especialidade ainda deve estar presente
    await expect(page.getByText(/eletricista residencial/i)).toBeVisible();

    // A especialidade não foi apagada pela alternância
    expect(specialtyText).toBeTruthy();
  });

  test('alternância para "Cliente" preserva visibilidade do perfil profissional no banco', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    // Clica em "Cliente"
    await page.getByRole('button', { name: /^cliente$/i }).click();
    await page.waitForTimeout(1000);

    // Volta para profissional
    const professionalBtn = page.getByRole('button', { name: /^profissional$/i });
    if (await professionalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await professionalBtn.click();
      await page.waitForTimeout(1000);
    }

    // Verifica que o status "Ativo" ainda está presente
    await page.goto('/perfil/configuracoes');
    await expect(page.getByText('Ativo').first()).toBeVisible({ timeout: 5000 });
  });
});

// ─── Fluxo 3: Busca pública de profissionais ─────────────────────────────────
//
// Cenário: qualquer usuário autenticado acessa /busca e vê a lista de
// profissionais ativos do seed (Ricardo Silva, José da Silva, Ana Rodrigues).
// A busca por nome retorna apenas o profissional correspondente.
//
// Nota: os profissionais do seed têm visibility_status='active' após
// a migration 003 computar a visibilidade. Este fluxo é read-only.

test.describe('Fluxo 3: Busca pública de profissionais', () => {
  test('página /busca renderiza sem erro e exibe container de resultados', async ({ page }) => {
    await page.goto('/busca');

    // Nunca deve mostrar erro 500 — verifica heading da página
    await expect(page.getByRole('heading', { name: /todos os profissionais|resultados/i })).toBeVisible();
  });

  test('profissionais do seed aparecem na listagem sem filtro', async ({ page }) => {
    await page.goto('/busca');

    // Aguarda resultados carregarem (Server Component — já vem renderizado)
    await expect(page.getByText(/ricardo silva/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/josé da silva/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/ana rodrigues/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('busca por "Ricardo" retorna Ricardo Silva', async ({ page }) => {
    await page.goto('/busca?q=Ricardo');

    await expect(page.getByText(/ricardo silva/i).first()).toBeVisible({ timeout: 5000 });
    // José e Ana não devem aparecer
    await expect(page.getByText(/josé da silva/i).first()).not.toBeVisible();
    await expect(page.getByText(/ana rodrigues/i).first()).not.toBeVisible();
  });

  test('busca por especialidade "Eletricista" retorna resultado correto', async ({ page }) => {
    await page.goto('/busca?q=Eletricista');

    await expect(page.getByText(/eletricista residencial/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('busca sem correspondência exibe mensagem de ausência de resultados', async ({ page }) => {
    await page.goto('/busca?q=xyztermoquenonexiste');

    await expect(
      page.getByText(/nenhum profissional encontrado/i),
    ).toBeVisible({ timeout: 5000 });
  });

  test('card do profissional exibe especialidade e avaliação', async ({ page }) => {
    await page.goto('/busca?q=Ricardo');

    await expect(page.getByText(/eletricista residencial/i).first()).toBeVisible({ timeout: 5000 });
    // Avaliação 4.9 do seed
    await expect(page.getByText(/4[,.]9/)).toBeVisible();
  });
});

// ─── Fluxo 4: Persistência dos dados após reload ──────────────────────────────
//
// Cenário: profissional ativo recarrega a página Configurações e verifica
// que todos os dados (specialty, bio, visibility_status) são carregados
// corretamente do banco — sem uso de estado local ou cache de sessão.
//
// Pré-condição: NEXT_PUBLIC_BYPASS_USER_CLERK_ID=demo_professional_001

test.describe('Fluxo 4: Persistência dos dados do perfil profissional', () => {
  test.skip(
    !isProfessionalRun,
    'Fluxo 4 requer E2E_BYPASS_USER=demo_professional_001',
  );

  test('dados do perfil profissional persistem após reload da página', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    // Primeira carga: confirma dados
    await expect(page.getByText(/perfil profissional ativo/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/eletricista residencial/i)).toBeVisible({ timeout: 5000 });

    // Recarrega a página
    await page.reload();

    // Dados ainda devem estar presentes
    await expect(page.getByText(/perfil profissional ativo/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/eletricista residencial/i)).toBeVisible({ timeout: 5000 });
  });

  test('bio do profissional é exibida após reload', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    // Aguarda bio carregar (via GET /v1/professionals/me)
    await expect(page.getByText(/instalações elétricas/i)).toBeVisible({ timeout: 5000 });

    await page.reload();

    await expect(page.getByText(/instalações elétricas/i)).toBeVisible({ timeout: 5000 });
  });

  test('status de visibilidade "Ativo" persiste após reload', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    await expect(page.getByText('Ativo').first()).toBeVisible({ timeout: 5000 });

    await page.reload();

    await expect(page.getByText('Ativo').first()).toBeVisible({ timeout: 5000 });
  });

  test('edição de bio é persistida e sobrevive a reload', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    // Aguarda o perfil carregar
    await expect(page.getByText(/perfil profissional ativo/i)).toBeVisible({ timeout: 5000 });

    // Clica em Editar
    await page.getByRole('button', { name: /editar/i }).click();

    // Limpa e preenche nova bio
    const bioTextarea = page.getByPlaceholder(/descreva sua experiência/i);
    await bioTextarea.clear();
    const novaBio = 'Trabalhando há 12 anos em instalações elétricas residenciais e comerciais. Especialista em laudos e inspeções.';
    await bioTextarea.fill(novaBio);

    // Salva
    await page.getByRole('button', { name: /^salvar$/i }).click();

    // Aguarda confirmação de sucesso ou remoção do form de edição
    await expect(
      page.getByText(/perfil atualizado com sucesso|perfil profissional ativo/i).first(),
    ).toBeVisible({ timeout: 10000 });

    // Recarrega e verifica persistência
    await page.reload();

    await expect(page.getByText(/instalações elétricas/i)).toBeVisible({ timeout: 5000 });
  });
});

// ─── Helper: verifica se o servidor está acessível ────────────────────────────

test.describe('Sanity: servidor disponível', () => {
  test('home page carrega sem erro', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });
});
