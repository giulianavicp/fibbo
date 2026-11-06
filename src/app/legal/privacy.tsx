import { LegalLayout } from './layout';

export default function Privacy() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      intro="O Fibbo é uma plataforma de apoio ao ensino de matemática para alunos e professores da FATEC, desenvolvida como Trabalho de Conclusão de Curso. Esta política explica, em linguagem simples, quais dados pessoais tratamos, por quê e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)."
    >
      <h2>1. Quais dados coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail, senha (guardada apenas de forma criptografada), perfil (aluno ou professor), unidade FATEC (opcional) e a data em que você aceitou esta política.</li>
        <li><strong>Uso acadêmico (alunos):</strong> disciplinas em que você entrou, respostas às atividades e provas, notas e correções, reflexões do diário e conversas com a Katherine.</li>
        <li><strong>Uso acadêmico (professores):</strong> disciplinas, atividades, provas, gabaritos, palavras-chave e materiais em PDF enviados.</li>
        <li><strong>Segurança:</strong> registros de tentativas de login (e-mail, data e se deu certo) e um registro das ações feitas na plataforma (por exemplo, criação de atividades e envios), usados para proteger as contas e investigar abusos.</li>
      </ul>
      <p>Não usamos cookies de publicidade nem ferramentas de rastreamento de terceiros.</p>

      <h2>2. Para que usamos os dados</h2>
      <ul>
        <li>Criar e proteger sua conta, inclusive bloqueando o login por 5 minutos após 3 senhas erradas.</li>
        <li>Corrigir atividades automaticamente, calcular notas e mostrar seu desempenho.</li>
        <li>Permitir que o professor acompanhe a turma, revise correções e exporte notas.</li>
        <li>Fazer a Katherine responder dúvidas com base nos materiais dos professores e gerar feedback.</li>
        <li>Mostrar o ranking da turma, em que outros alunos veem apenas seu primeiro nome, a inicial do sobrenome e sua pontuação (XP).</li>
      </ul>

      <h2>3. Base legal</h2>
      <p>Tratamos seus dados com base no seu <strong>consentimento</strong> (art. 7º, I, da LGPD), dado no momento do cadastro, e para <strong>executar o serviço</strong> que você solicitou ao criar a conta (art. 7º, V). Você pode retirar o consentimento a qualquer momento excluindo sua conta.</p>

      <h2>4. Quem pode ver seus dados</h2>
      <ul>
        <li><strong>Você</strong> vê todos os seus dados.</li>
        <li><strong>Professores</strong> veem nome, respostas, notas e entregas dos alunos matriculados nas próprias disciplinas. Eles também podem ver as perguntas feitas à Katherine na disciplina, <strong>sem a identificação de quem perguntou</strong>.</li>
        <li><strong>Outros alunos</strong> veem apenas o seu primeiro nome, a inicial do sobrenome e o XP no ranking.</li>
        <li>O diário e as conversas com a Katherine são visíveis só para você.</li>
      </ul>

      <h2>5. Serviços que tratam dados em nosso nome</h2>
      <p>Para funcionar, o Fibbo usa os seguintes fornecedores (operadores, na linguagem da LGPD):</p>
      <ul>
        <li><strong>Supabase:</strong> banco de dados, autenticação e armazenamento de arquivos, em servidores na região de São Paulo.</li>
        <li><strong>Vercel:</strong> hospedagem do site. O acesso ao site passa pelos servidores da Vercel, inclusive fora do Brasil.</li>
        <li><strong>Google (API Gemini):</strong> as perguntas feitas à Katherine, os trechos dos materiais usados para responder e os resumos de correção usados para gerar feedback são enviados ao Google para processamento. O Fibbo usa o plano gratuito da API, no qual <strong>o Google pode usar esse conteúdo para melhorar seus produtos, inclusive com revisão humana</strong>. Por isso, <strong>não escreva dados pessoais ou sensíveis nas perguntas à Katherine</strong>.</li>
        <li><strong>Brevo:</strong> envio dos e-mails de confirmação de cadastro e de recuperação de senha, a partir do endereço de contato do Fibbo.</li>
      </ul>
      <p>Alguns desses serviços processam dados fora do Brasil. Essas transferências ocorrem para viabilizar o serviço que você solicitou (art. 33 da LGPD).</p>

      <h2>6. Por quanto tempo guardamos</h2>
      <p>Seus dados ficam guardados enquanto sua conta existir. Quando você exclui a conta, apagamos seu perfil, envios, notas, diário, conversas e, no caso de professores, as disciplinas, atividades e materiais. Os registros de segurança (ações e tentativas de login) podem ser mantidos sem vínculo com seu perfil, para proteção da plataforma.</p>

      <h2>7. Seus direitos</h2>
      <p>Pela LGPD (art. 18), você pode:</p>
      <ul>
        <li><strong>Acessar e levar seus dados:</strong> em Perfil → Seus dados → <em>Baixar meus dados</em>, você recebe um arquivo com tudo o que guardamos sobre você.</li>
        <li><strong>Corrigir dados:</strong> nome e unidade podem ser alterados no seu perfil.</li>
        <li><strong>Excluir seus dados e revogar o consentimento:</strong> em Perfil → Seus dados → <em>Excluir minha conta</em>.</li>
        <li><strong>Obter informações</strong> sobre o tratamento e os fornecedores com quem os dados são compartilhados, descritos nesta política.</li>
        <li><strong>Qualquer outro pedido</strong> previsto no art. 18, pelo e-mail da seção Contato.</li>
      </ul>

      <h2>8. Segurança</h2>
      <p>Usamos conexões criptografadas (HTTPS), senhas armazenadas com criptografia, regras de acesso no banco de dados que impedem que um usuário veja dados de outro, bloqueio temporário após tentativas de login erradas e limite de uso da Katherine. Nenhum sistema é totalmente imune a falhas; se identificarmos um incidente que afete seus dados, avisaremos os usuários afetados.</p>

      <h2>9. Público</h2>
      <p>O Fibbo é destinado a estudantes e professores de cursos de graduação.</p>

      <h2>10. Alterações</h2>
      <p>Podemos atualizar esta política. Mudanças relevantes serão informadas na plataforma, e a data no topo da página indica a versão em vigor.</p>

      <h2>11. Contato</h2>
      <p>Para exercer seus direitos, tirar dúvidas sobre esta política ou relatar um problema com seus dados, escreva para <a href="mailto:giuliana.pedrassi@aluno.cps.sp.gov.br">giuliana.pedrassi@aluno.cps.sp.gov.br</a>. Respondemos em até 15 dias.</p>
    </LegalLayout>
  );
}
