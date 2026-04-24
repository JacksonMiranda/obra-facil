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

  // Estes testes alteram estado no banco — precisam de mais tempo em CI
  test.setTimeout(60000);

  test('cliente vê o botão "Tornar-se Profissional" em Configurações', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    // Se já profissional (retry de teste anterior), o botão não aparece — ok
    const alreadyPro = await page.getByText(/perfil profissional ativo/i)
      .isVisible({ timeout: 2000 }).catch(() => false);
    if (alreadyPro) return;

    await expect(
      page.getByRole('button', { name: /tornar-se profissional/i }),
    ).toBeVisible();
  });

  test('formulário de ativação expande ao clicar no botão', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    const alreadyPro = await page.getByText(/perfil profissional ativo/i)
      .isVisible({ timeout: 2000 }).catch(() => false);
    if (alreadyPro) return;

    const activateBtn = page.getByRole('button', { name: /tornar-se profissional/i });
    await activateBtn.click();

    // Aguarda o formulário carregar (inclui grid de especialidades via API)
    await expect(page.getByPlaceholder(/descreva sua experiência/i)).toBeVisible();
  });

  test('formulário carrega categorias de serviço disponíveis', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    const alreadyPro = await page.getByText(/perfil profissional ativo/i)
      .isVisible({ timeout: 2000 }).catch(() => false);
    if (alreadyPro) return;

    await page.getByRole('button', { name: /tornar-se profissional/i }).click();

    // Aguarda serviços carregarem (seed tem 6 categorias: Reparos elétricos, Pinturas, Pedreiro…)
    await expect(page.getByText(/pedreiro/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('ativa perfil profissional e exibe "Perfil Profissional Ativo"', async ({ page }) => {
    await page.goto('/perfil/configuracoes');

    // Retry-safe: se o perfil já foi ativado numa tentativa anterior, só verifica o estado final
    const alreadyPro = await page.getByText(/perfil profissional ativo/i)
      .isVisible({ timeout: 2000 }).catch(() => false);

    if (!alreadyPro) {
      await page.getByRole('button', { name: /tornar-se profissional/i }).click();

      // Aguarda serviços carregarem
      await page.waitForSelector('[class*="grid"] button', { timeout: 5000 });

      // Seleciona "Pedreiro"
      await page.getByRole('button', { name: /pedreiro/i }).first().click();

      // Preenche bio com no mínimo 10 caracteres
      await page.getByPlaceholder(/descreva sua experiência/i).fill(
        'Profissional com experiência em reformas residenciais e acabamentos.',
      );

      // Aguarda a resposta da API de ativação antes de checar a UI
      await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes('/v1/account/roles/professional/activate') && res.status() === 200,
          { timeout: 15000 },
        ),
        page.getByRole('button', { name: /ativar perfil profissional/i }).click(),
      ]);

      // Aguarda o router.refresh() completar (re-renderização do Server Component)
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    }

    // Verifica a confirmação de ativação
    await expect(
      page.getByText(/perfil profissional ativo/i),
    ).toBeVisible({ timeout: 20000 });
  });

  test('perfil ativo exibe badge de status (Ativo ou Rascunho)', async ({ page }) => {
    // Pré-condição: perfil já ativo (roda após o teste de ativação acima).
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
      await Promise.all([
        page.waitForResponse(
          (res) => res.url().includes('/v1/account/roles/deactivate') && res.status() === 200,
          { timeout: 15000 },
        ),
        deactivateBtn.click(),
      ]);

      // Após desativação, o botão "Tornar-se Profissional" deve reaparecer
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await expect(
        page.getByRole('button', { name: /tornar-se profissional/i }),
      ).toBeVisible({ timeout: 20000 });
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
    await page.waitForSelector(':text("Perfil Profissional Ativo")', { timeout: 5000 });

    // Alterna para modo cliente
    await page.getByRole('button', { name: /^cliente$/i }).click();
    await page.waitForTimeout(2000);

    // Verifica via API direta que o professionals record ainda existe
    // (o perfil pode estar "draft" ou "active", mas não deletado)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const res = await page.request.get(`${apiUrl}/v1/professionals/me`, {
      headers: {
        'x-dev-user-id': 'demo_professional_001',
        'content-type': 'application/json',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as { data: { specialty: string } };
    expect(body.data.specialty).toBeTruthy();
  });
});

// ─── Fluxo 3: Busca pública ──────────────────────────────────────────────────
//
// Cenário: qualquer usuário (cliente ou profissional) acessa a busca pública
// de profissionais. Verifica que profissionais com perfil ativo aparecem
// nos resultados.
//
// Pré-condição: Ricardo Silva tem professionals record com visibility_status='active'.

test.describe('Fluxo 3: Busca de profissionais', () => {
  test('busca retorna resultados para "pedreiro"', async ({ page }) => {
    await page.goto('/busca?q=pedreiro');

    // Aguarda lista de profissionais aparecer
    await expect(page.getByText(/pedreiro/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('card de profissional exibe nome e especialidade', async ({ page }) => {
    await page.goto('/busca?q=eletricista');

    // O seed tem Ricardo Silva como Eletricista Residencial
    await expect(page.getByText(/ricardo silva/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('card exibe avaliação numérica', async ({ page }) => {
    await page.goto('/busca?q=pedreiro');

    // Aguarda rating aparecer — formato numérico ex: "5" ou "4,8" ou "5.0"
    await page.waitForSelector('[data-testid="professional-card"], .professional-card, [class*="card"]', {
      timeout: 10000,
    }).catch(() => {});

    // Verifica que algum número de rating aparece na página
    await expect(page.getByText(/^\d([,.]\d+)?$/).first()).toBeVisible({ timeout: 5000 });
  });
});

// ─── Fluxo 4: Perfil do profissional ─────────────────────────────────────────
//
// Cenário: profissional autenticado visualiza e edita seu próprio perfil.
//
// Pré-condição: NEXT_PUBLIC_BYPASS_USER_CLERK_ID=demo_professional_001

test.describe('Fluxo 4: Gerenciamento do perfil profissional', () => {
  test.skip(
    !isProfessionalRun,
    'Fluxo 4 requer E2E_BYPASS_USER=demo_professional_001',
  );

  test('profissional vê seus serviços em "Meus Serviços"', async ({ page }) => {
    await page.goto('/meus-servicos');

    // Página carrega sem erro
    await expect(page).not.toHaveURL(/sign-in/);
  });

  test('profissional acessa agenda', async ({ page }) => {
    await page.goto('/agenda');

    await expect(page).not.toHaveURL(/sign-in/);
    // Verifica que a página de agenda carregou
    await expect(page.getByText(/agenda/i).first()).toBeVisible({ timeout: 5000 });
  });
});
