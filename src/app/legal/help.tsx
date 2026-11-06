import type { ReactNode } from 'react';
import { C } from '../lib/tokens';
import { LegalLayout } from './layout';

function Q({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '0.625rem', padding: '0.75rem 0.875rem', marginBottom: '0.5rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>{q}</summary>
      <div style={{ marginTop: '0.5rem', color: C.textSec, fontSize: '0.88rem' }}>{children}</div>
    </details>
  );
}

export default function Help() {
  return (
    <LegalLayout title="Central de Ajuda" intro="Respostas rápidas para as dúvidas mais comuns de alunos e professores.">
      <h2>Para alunos</h2>
      <Q q="Como entro em uma disciplina?">Peça ao professor o código de acesso (por exemplo, CALC01). Depois, vá em <strong>Disciplinas</strong>, digite o código no campo “Entrar em uma disciplina” e toque em Entrar.</Q>
      <Q q="Como resolvo uma atividade?">Em <strong>Disciplinas → Ver atividades</strong>, toque em <strong>Resolver</strong>. Responda as questões e toque em <strong>Enviar respostas</strong>. Você só pode enviar uma vez, então revise antes.</Q>
      <Q q="Como funciona a nota?">Objetivas valem 100 se corretas e 0 se erradas. Dissertativas recebem a porcentagem de palavras-chave encontradas na resposta: azul (80% ou mais), verde (60% ou mais), amarelo (40% ou mais) e vermelho (abaixo de 40%). A nota final combina 60% das objetivas e 40% das dissertativas. O professor pode revisar e ajustar.</Q>
      <Q q="Onde vejo minhas correções?">Em <strong>Correções</strong>. Toque em uma atividade para ver cada questão, a resposta correta, as palavras-chave encontradas e um feedback da Katherine.</Q>
      <Q q="O que a Katherine sabe responder?">Ela responde com base nos materiais em PDF que os professores enviaram. Se o assunto não estiver nos materiais, ela avisa. Você pode escolher uma disciplina ou atividade para focar a conversa, e em atividades ainda não entregues ela dá dicas em vez da resposta.</Q>
      <Q q="Como ganho XP?">Cada atividade entregue rende pontos de acordo com a nota, com bônus por entregar no prazo, e cada reflexão no diário vale 5 XP. A sequência de dias conta os dias seguidos em que você entregou algo ou escreveu no diário.</Q>

      <h2>Para professores</h2>
      <Q q="Como crio uma disciplina e convido alunos?">Em <strong>Disciplinas → Nova disciplina</strong>, informe código, nome e tópicos. Cada disciplina recebe um código de acesso: clique nele para copiar e envie aos alunos.</Q>
      <Q q="Como cadastro uma atividade ou prova?">Em <strong>Atividades</strong> ou <strong>Provas</strong>, clique em Nova. Para questões objetivas, preencha as 4 alternativas e marque a correta. Para dissertativas, informe as palavras-chave esperadas, separadas por vírgula. A atividade é publicada para os alunos ao salvar.</Q>
      <Q q="Posso publicar a mesma atividade em várias unidades?">Sim. Ao criar a atividade ou prova, escolha até 3 unidades FATEC e marque as disciplinas em que ela deve ser publicada. Para mais unidades, publique e cadastre de novo.</Q>
      <Q q="Como anexo o gabarito em arquivo?">Em <strong>Atividades</strong> ou <strong>Provas</strong>, no cartão da atividade, clique em <strong>Anexar PDF ou imagem</strong> (PDF, PNG ou JPG, até 10 MB). Os alunos só conseguem baixar o arquivo depois do prazo.</Q>
      <Q q="Como reviso as correções?">Em <strong>Correções</strong> aparecem os envios com dissertativas a revisar. Abra um envio, ajuste a pontuação de uma resposta se necessário (a nota é recalculada na hora) e marque como revisada. Também é possível aprovar todas de uma vez.</Q>
      <Q q="Como a Katherine usa meus materiais?">Em <strong>Disciplinas</strong>, envie PDFs na seção “Materiais de apoio”. O status mostra quando o material está pronto. PDFs escaneados (imagem) não podem ser lidos; use arquivos com texto selecionável.</Q>
      <Q q="Como exporto as notas?">Em <strong>Relatórios</strong>, escolha a disciplina e baixe o CSV, que abre no Excel ou no Google Planilhas. Ali também dá para baixar as perguntas que os alunos fizeram à Katherine, sem identificação.</Q>

      <h2>Conta e privacidade</h2>
      <Q q="Esqueci minha senha">Na tela de login, clique em <strong>Esqueci minha senha</strong> e siga o link enviado ao seu e-mail. Confira também a caixa de spam.</Q>
      <Q q="Minha conta foi bloqueada">Após 3 senhas erradas, o login fica bloqueado por 5 minutos. Aguarde e tente de novo, ou recupere a senha.</Q>
      <Q q="Como baixo ou excluo meus dados?">No seu <strong>Perfil</strong>, na seção “Seus dados (LGPD)”, você pode baixar todos os seus dados ou excluir a conta.</Q>
      <Q q="Não encontrei minha resposta">Escreva para <a href="mailto:giuliana.pedrassi@aluno.cps.sp.gov.br">giuliana.pedrassi@aluno.cps.sp.gov.br</a>.</Q>
    </LegalLayout>
  );
}
