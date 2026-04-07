import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function TermosPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Termos de Uso" />

      <div className="px-4 mt-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-[10px] text-slate-400 mb-4">Ultima atualizacao: 01 de abril de 2026</p>

          <h2 className="text-sm font-bold text-slate-900 mb-2">1. Aceitacao dos Termos</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Ao acessar e utilizar a plataforma Obra Facil, voce concorda com estes Termos de Uso.
            A plataforma conecta proprietarios de imoveis a profissionais qualificados da construcao civil
            e lojas de materiais parceiras, facilitando a contratacao de servicos e aquisicao de materiais.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mb-2">2. Servicos Oferecidos</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            A Obra Facil atua como intermediadora, disponibilizando: busca e avaliacao de profissionais
            verificados; comunicacao direta via chat; cotacao automatica de materiais em lojas parceiras;
            e acompanhamento de obras em andamento. Nao nos responsabilizamos pela execucao dos servicos
            contratados entre usuarios e profissionais.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mb-2">3. Cadastro e Responsabilidades</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            O usuario deve fornecer informacoes verdadeiras no cadastro e manter seus dados atualizados.
            E de responsabilidade do usuario proteger suas credenciais de acesso. Qualquer atividade
            realizada com sua conta sera de sua responsabilidade.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mb-2">4. Privacidade e Dados</h2>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Seus dados pessoais sao tratados conforme a Lei Geral de Protecao de Dados (LGPD).
            Coletamos apenas informacoes necessarias para a prestacao dos servicos. Para mais detalhes,
            consulte nossa Politica de Privacidade.
          </p>

          <h2 className="text-sm font-bold text-slate-900 mb-2">5. Contato</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Em caso de duvidas sobre estes termos, entre em contato pelo e-mail suporte@obrafacil.com.br
            ou pelo WhatsApp (31) 99999-0000.
          </p>
        </div>
      </div>
    </div>
  );
}
