import { auth } from '@/lib/auth-bypass';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';

const FAQ = [
  { q: 'Como contratar um profissional?', a: 'Na tela inicial, busque pelo servico desejado, escolha um profissional bem avaliado e clique em "Solicitar Orcamento". Voce sera redirecionado para o chat onde pode combinar todos os detalhes.' },
  { q: 'Como funciona a cotacao de materiais?', a: 'Apos o profissional avaliar o servico, ele envia uma lista de materiais pelo chat. O sistema busca automaticamente os melhores precos em lojas parceiras e voce escolhe a melhor oferta.' },
  { q: 'Posso cancelar um pedido?', a: 'Sim. Acesse "Meus Pedidos", selecione o pedido desejado e clique em "Cancelar Pedido". Pedidos ja enviados nao podem ser cancelados.' },
  { q: 'Como avaliar um profissional?', a: 'Apos a conclusao do servico, voce recebera uma notificacao para avaliar o profissional. A avaliacao ajuda outros usuarios a encontrarem bons profissionais.' },
];

export default async function AjudaPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <div className="pb-24 bg-surface min-h-screen">
      <PageHeader title="Ajuda e Suporte" />

      {/* FAQ */}
      <div className="px-4 mt-4">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Perguntas Frequentes</h2>
        <div className="flex flex-col gap-2">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group"
            >
              <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none">
                <span className="material-symbols-outlined text-lg text-trust">help</span>
                <span className="text-sm font-medium text-slate-700 flex-1">{item.q}</span>
                <span className="material-symbols-outlined text-slate-300 text-lg transition-transform group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <div className="px-4 pb-4 pt-0 ml-9">
                <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Canais de Atendimento */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Canais de Atendimento</h2>
        <div className="flex flex-col gap-2">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-savings/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-savings">chat</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">WhatsApp</p>
              <p className="text-xs text-slate-400">(31) 99999-0000</p>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-trust/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg text-trust">mail</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">E-mail</p>
              <p className="text-xs text-slate-400">suporte@obrafacil.com.br</p>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </div>
        </div>
      </div>
    </div>
  );
}
