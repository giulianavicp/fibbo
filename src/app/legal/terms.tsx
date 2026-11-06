import { Link } from 'react-router';
import { LegalLayout } from './layout';

export default function Terms() {
  return (
    <LegalLayout
      title="Termos de Uso"
      intro="Ao criar uma conta no Fibbo, você concorda com estes termos. Leia também a nossa política de privacidade."
    >
      <h2>1. O que é o Fibbo</h2>
      <p>O Fibbo é uma plataforma de apoio ao ensino de matemática, desenvolvida como Trabalho de Conclusão de Curso, que oferece correção automática de atividades, acompanhamento de desempenho e a Katherine, uma tutora com inteligência artificial. O Fibbo não é um sistema oficial da FATEC nem substitui o SIGA ou outros sistemas acadêmicos da instituição.</p>

      <h2>2. Sua conta</h2>
      <ul>
        <li>Use informações verdadeiras e escolha o perfil correto (aluno ou professor).</li>
        <li>Mantenha sua senha em segredo. Você é responsável pelo que for feito com a sua conta.</li>
        <li>Após 3 tentativas de login erradas, a conta fica bloqueada por 5 minutos.</li>
      </ul>

      <h2>3. Correção automática</h2>
      <p>As questões objetivas são corrigidas comparando sua resposta com o gabarito. As dissertativas recebem uma pontuação pela proporção de palavras-chave definidas pelo professor encontradas na resposta. Essa correção é uma estimativa e <strong>pode ser revisada e ajustada pelo professor</strong>, que tem a palavra final sobre as notas.</p>

      <h2>4. Katherine (inteligência artificial)</h2>
      <ul>
        <li>A Katherine responde com base nos materiais enviados pelos professores, mas <strong>pode cometer erros</strong>. Confira informações importantes com o professor.</li>
        <li>Ela é uma ferramenta de apoio ao estudo e não substitui as aulas nem o professor.</li>
        <li>Em atividades ainda não entregues, a Katherine dá dicas em vez de respostas prontas.</li>
        <li>Há um limite de 40 perguntas por hora por aluno.</li>
        <li>Não escreva dados pessoais ou sensíveis nas perguntas: elas são processadas pelo Google (veja a <Link to="/privacidade">política de privacidade</Link>).</li>
      </ul>

      <h2>5. Conduta</h2>
      <p>Não é permitido usar o Fibbo para tentar acessar dados de outras pessoas, contornar as regras de segurança, enviar conteúdo ilegal, ofensivo ou que viole direitos autorais, nem para fraudar avaliações. Contas que violarem estes termos podem ser suspensas.</p>

      <h2>6. Conteúdo dos professores</h2>
      <p>Os materiais, atividades e gabaritos pertencem aos professores que os enviaram, que são responsáveis por ter o direito de compartilhá-los com a turma. Os alunos podem usá-los apenas para estudo.</p>

      <h2>7. Disponibilidade</h2>
      <p>O Fibbo funciona em serviços de nuvem gratuitos e pode ficar lento ou indisponível em alguns momentos. Não garantimos funcionamento ininterrupto. Recomendamos guardar cópias de materiais importantes.</p>

      <h2>8. Encerramento</h2>
      <p>Você pode excluir sua conta a qualquer momento em Perfil → Seus dados. O projeto pode ser encerrado ao fim do período acadêmico; nesse caso, os usuários serão avisados com antecedência para baixar seus dados.</p>

      <h2>9. Alterações</h2>
      <p>Estes termos podem ser atualizados. A data no topo da página indica a versão em vigor.</p>
    </LegalLayout>
  );
}
