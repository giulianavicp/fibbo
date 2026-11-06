Atue como Product Manager Sênior, UX Designer, UI Designer, Arquiteto de Software Full Stack, Especialista em IA Educacional e Desenvolvedor Sênior.
Desenvolva uma plataforma web responsiva integrada ao SIGAA para apoio ao ensino de matemática utilizando Inteligência Artificial. 
1. Contexto do Projeto
O site é uma plataforma educacional (EdTech) voltada para alunos e professores das unidades da FATEC. O sistema atua como um ambiente externo que conta com Inteligência Artificial e é acessada através do mesmo login do SIGAA.
O objetivo principal é automatizar tarefas docentes (como correção de atividades) e potencializar o aprendizado dos alunos através de uma IA tutora (permitindo correção instantânea, recomendação de estudos, feedback parcial e visualização de dashboard de desempenho).
OBJETIVO: Criar uma plataforma educacional moderna que permita:
Integração de autenticação com SIGAA
Apoio ao aprendizado através de IA
Correção automática de atividades
Gestão de desempenho acadêmico
Acompanhamento de turmas pelos professores
PÚBLICO-ALVO: Alunos de graduação e professores da FATEC.
OBJETIVOS DE NEGÓCIO
Melhorar o desempenho dos alunos em matemática.
Reduzir a carga operacional dos professores.
Automatizar correções e análises.
Disponibilizar suporte personalizado através de IA.
Centralizar informações acadêmicas em um único ambiente.
FUNCIONALIDADES PRINCIPAIS
Módulo: Autenticação
Login de aluno integrado ao SIGAA.
Login de professor integrado ao SIGAA.
Bloqueio após 3 tentativas inválidas.
Controle de licença para alunos e professores.
Tratamento de falhas de conexão.
Recuperação segura de sessão.
Módulo: Professor
Login com SSO da FATEC.
Seleção de unidade FATEC.
Seleção de disciplinas.
Upload de atividades.
Upload de provas.
Upload de gabaritos.
Upload de palavras-chave para questões dissertativas.
Dashboard de desempenho da turma.
Dashboard de desempenho do aluno (por nome).
Módulo: Aluno
Login com SSO da FATEC.
Correção de respostas de provas.
Correção de respostas de atividades.
Consulta de notas.
Consulta de desempenho (por dashboard).
Solicitar feedback para a IA.
Histórico de correções
Módulo: IA Educacional
Chat para dúvidas em matemática.
Respostas baseadas apenas no conteúdo enviado pelo professor através da plataforma.
Contextualização por disciplina.
Contextualização por atividade.
Histórico de conversas.
Feedback geral
Feedback por disciplina
Módulo: Correção Automática
Questões objetivas:
Comparação das respostas do aluno com o gabarito.
Cálculo automático de nota baseado em múltipla escolha (certo ou errado).
Feedback de acertos e erros (focando em qual assunto houve mais defasagem).
Questões dissertativas:
Análise por palavras-chave.
Classificação:
Correta (questões são destacadas na cor verde, representando ≥ 80% das palavras-chaves descritas pelo professor)
Parcialmente correta (questões são destacadas na cor amarelo, representando ≥ 60% das palavras-chaves descritas pelo professor)
Incorreta (questões são destacadas na cor vermelho representando ≤ 40% das palavras-chaves descritas pelo professor)
Módulo: Analytics
Dashboard da turma com opção de seleção por aluno, para professores, contendo:
Média da turma.
Distribuição de notas.
Principais dificuldades (baseada no tema das questões mais erradas).
Dúvidas mais frequentes (baseada nas questões com mais índice de erro).
Evolução de desempenho da turma.

2. Diretrizes de UX/UI 
PRIORIDADE DE PROJETO
CRÍTICO:
Ao projetar a plataforma, priorizar a qualidade do produto na seguinte ordem:
Funcionalidade
Usabilidade
Responsividade
Acessibilidade
Estética visual
O design nunca deve comprometer a funcionalidade dos componentes.
Todos os elementos visuais apresentados devem possuir implementação funcional correspondente.
Nenhum botão, card, gráfico, dashboard ou formulário pode existir apenas para fins estéticos.
O sistema deve apresentar fluxos completos de:
criação
edição
exclusão
upload
busca
filtros
atualização automática
feedback visual
Sempre priorizando experiência real de uso.
A Inteligência Artificial utilizada para gerar as telas deve focar primeiro nos fluxos funcionais e depois no refinamento visual.
O objetivo não é produzir apenas interfaces bonitas, mas interfaces utilizáveis e implementáveis em ambiente real.
A interface precisa ser moderna, acadêmica e focada em usabilidade, garantindo uma diferenciação clara entre a interface do Aluno e a interface do Professor desde o login.
A interface deve ser "Mobile-First", intuitiva e ter um cuidado especial com o tratamento de erros (Empty States/Error States). 
Objetivos:
Interface extremamente intuitiva.
Mobile First.
Navegação em até 3 cliques.
Acessibilidade WCAG 2.1 AA.
Design moderno inspirado em plataformas como Canvas e Notion.
PÁGINAS DE MENU
Login
Perfil
Disciplinas
Atividades
Provas
Correções
Katherine (IA)
Dashboard do Aluno 
Dashboard do Professor (visível somente no acesso de docente)
Relatórios (visível somente no acesso de docente)
Dashboard Analítico (visível somente no acesso de docente)
IA
RAG (Retrieval Augmented Generation)
Baseado nos materiais enviados pelos professores
Embeddings para busca semântica
Armazenamento
AWS S3 ou equivalente
Autenticação
OAuth2
JWT
Integração SIGAA
SEGURANÇA
Implementar:
JWT
Refresh Token
RBAC (controle por papéis)
Criptografia de dados sensíveis
Proteção contra SQL Injection
Proteção contra XSS
Proteção contra CSRF
Rate Limiting
Auditoria completa de ações
Logs de segurança
LGPD
Consentimento explícito.
Exclusão de dados.
Anonimização para relatórios.
Controle de retenção de dados.
QUALIDADE DE CÓDIGO
SOLID
Clean Architecture
Clean Code
Design Patterns
Testes Unitários
Testes de Integração
Testes E2E
Documentação OpenAPI/Swagger
PERFORMANCE
Lazy Loading
Paginação
Cache Redis
CDN
Otimização de imagens
Core Web Vitals > 90
Tempo médio de resposta < 500ms
ENTREGÁVEIS
Personas.
Jornada do Aluno.
Jornada do Professor.
Wireframes.
Design System.
Protótipo de alta fidelidade.
Arquitetura completa.
Modelo ER do banco.
APIs REST.
Estrutura de pastas.
Plano de testes.
Plano de deploy.
Código inicial completo.
Roadmap MVP e versão final.

3. Identidade visual completa
3. Identidade Visual Completa
Conceito e Tipografia
Nome e Símbolo
O nome Fibbo deriva da Sequência de Fibonacci e da Proporção Áurea.
A identidade visual deve transmitir:
Precisão matemática;
Evolução contínua;
Organização lógica;
Aprendizado progressivo;
Tecnologia educacional humanizada.
O símbolo principal deve utilizar referências à Espiral de Ouro, formas geométricas, grids matemáticos e construções proporcionais.
A marca deve equilibrar rigor acadêmico e acolhimento visual, evitando aparência excessivamente corporativa ou excessivamente infantil.
Tipografia
Utilizar fonte Sans-Serif moderna e altamente legível:
Inter (preferencial)
Poppins
Roboto
Critérios:
Excelente leitura em dispositivos móveis;
Boa renderização em dashboards;
Alta acessibilidade;
Escala tipográfica consistente.
Princípios Visuais
A identidade visual deve seguir os seguintes princípios:
Hierarquia Visual Clara
A interface deve possuir apenas:
1 cor principal da marca;
1 escala neutra predominante;
Cores semânticas utilizadas apenas quando necessário.
O usuário deve conseguir identificar imediatamente:
O que é informação principal;
O que é informação secundária;
O que exige atenção;
O que representa sucesso ou erro.
Redução de Ruído Visual
Evitar:
Excesso de tons de marrom simultâneos;
Muitas temperaturas diferentes da mesma cor;
Muitos elementos coloridos na mesma tela;
Uso simultâneo de verde, amarelo e vermelho em grande quantidade.
Priorizar:
Espaços em branco;
Contraste;
Legibilidade;
Respiração visual.
Regra dos Pontos Focais
As cores semânticas devem ser reservadas apenas para eventos importantes:
Verde:
Conquistas;
Excelente desempenho;
Aprovação;
Exercícios concluídos.
Amarelo:
Avisos;
Feedback parcial;
Atenção moderada.
Vermelho:
Erros;
Pendências críticas;
Falhas de login;
Atividades atrasadas.
Essas cores não devem competir visualmente entre si na mesma tela.
Paleta Oficial (Color Tokens)
Cores Primárias
Marca Principal:
Marrom Fibbo → #8C421B
Neutros
Fundo Principal:
#F8F5F0
Cards:
#FFFFFF
Títulos:
#2E2A26
Texto Secundário:
#8A817A
Texto Terciário:
#A89F96
Bordas:
#E9E2D9
Escala da Marca
Uso controlado da cor institucional:
#8C421B
#A47148
#D4A276
Evitar a criação de novos tons intermediários fora da escala definida.
Cores Semânticas
Sucesso:
Cor Principal → #2F5E34
Fundo → #EDF7EE
Desempenho Excelente:
#7A9E7E
Aviso:
#FFAF03
Fundo → #FFF8E5
Erro:
Cor Principal → #B23A2F
Fundo → #FFF4F3
Uso:
Erros de login
Questões incorretas
Pendências críticas
Alertas importantes
Histórico de correções
Diretrizes:
Evitar grandes blocos vermelhos.
Utilizar preferencialmente:
borda lateral
ícone de alerta
badge discreto
texto de apoio
Objetivo:
Transmitir urgência e atenção sem gerar agressividade visual ou competir excessivamente com os conteúdos principais.
Pendência:
#9A7B63
Barra vazia:
#ECE7E1
Regras de Uso das Cores
Notas
Evitar colorir todas as notas.
Padrão:
Nota comum → texto neutro (#2E2A26)
Nota excelente (> 9,0) → verde
Nota crítica (< 6,0) → vermelho
Objetivo: Reduzir ruído visual e excesso de pontos focais.
Barras de Progresso
Barra vazia:
#ECE7E1
Barra preenchida:
#7A9E7E
Evitar barras utilizando marrom escuro.
Alertas
Evitar grandes blocos vermelhos.
Preferir:
Fundo suave;
Borda lateral;
Ícone discreto.
Exemplo:
Atividade atrasada:
Fundo → #FFF8F7
Borda esquerda → #D38A82
Estilo de Interface (UI Components)
Card UI
Toda a plataforma deve utilizar arquitetura baseada em cartões.
Características:
Bordas arredondadas (12px a 16px);
Sombras suaves;
Alto espaçamento interno;
Separação clara de informações.
Espaçamento
Aplicar ritmo visual consistente:
8px
16px
24px
32px
Evitar telas excessivamente densas. O usuário deve encontrar áreas de descanso visual entre seções.
Iconografia
Estilo:
Outline
Traço fino
Geométrico
Referências:
Régua
Compasso
Transferidor
Esquadro
Gráficos matemáticos
Diagramas geométricos
Empty States
Estados vazios devem possuir:
Ilustração amigável;
Linguagem acolhedora;
Sugestão clara de próxima ação.
Sempre seguindo a paleta neutra da marca.
Diferenciação dos Perfis
Professor
Objetivo: Tomada de decisão e análise.
Características:
Layout mais denso;
Sidebar fixa;
Dashboards analíticos;
KPIs;
Tabelas;
Gráficos comparativos.
Visual:
Maior uso da cor institucional;
Destaque para métricas;
Menor uso de elementos lúdicos.
Aluno
Objetivo: Aprendizagem e engajamento.
Características:
Mobile First;
Interface minimalista;
Navegação simplificada;
Jornada diária orientada pela IA Katherine.
Visual:
Mais espaço em branco;
Menos densidade informacional;
Progresso destacado;
Gamificação discreta.
Navegação Mobile
Bottom Navigation:
Estado ativo:
#8C421B
Estado inativo:
#B8AEA5
Evitar indicadores adicionais (bolhas, fundos coloridos ou badges desnecessários).

Referências Estéticas
A interface deve combinar elementos de:
Notion (organização e clareza);
Canvas LMS (estrutura acadêmica);
Aplicativos educacionais japoneses e coreanos modernos.
Priorizar:
Hierarquia visual forte;
Contraste adequado;
Baixa fadiga visual;
Aparência sofisticada e contemporânea.
Design de Interação (UX Funcional)
A plataforma não deve apresentar apenas interfaces visuais. Todos os componentes devem possuir comportamento funcional claramente especificado.
Princípio Fundamental
Cada elemento visual exibido na tela deve possuir:
Estado inicial
Estado de carregamento
Estado de sucesso
Estado de erro
Estado vazio (Empty State)
Nenhum botão, card, gráfico ou formulário pode ser apresentado sem sua lógica de interação correspondente.
Botões (Buttons)
Todos os botões devem possuir:
Estado Normal
Botão disponível para interação.
Hover
Mudança suave de cor ou elevação.
Pressed / Touch
Feedback visual imediato em até 100ms.
Exemplos:
redução de escala (98%)
alteração de sombra
mudança de tonalidade
Loading
Substituição do texto por spinner.
Exemplo:
"Enviar Atividade"
↓
"Enviando..."
Sucesso
Feedback visual após ação concluída.
Exemplo:
✓ Atividade enviada com sucesso
Erro
Mensagem clara explicando o problema.
Exemplo:
Não foi possível enviar o arquivo.
Tente novamente.
Formulários
Todos os formulários devem utilizar:
Validação em tempo real.
Exemplos:
✓ E-mail válido
✕ Senha muito curta
✓ Arquivo enviado
Campos obrigatórios devem ser identificados visualmente.
Não utilizar validação apenas após clicar em "Enviar".
Upload de Arquivos
Upload de atividades, provas e gabaritos deve possuir:
Drag and Drop
Seleção por clique
Barra de progresso
Cancelamento de upload
Reenvio automático em falha de conexão
Exemplo:
Arquivo.pdf
███████░░░ 70%
Enviando...
Atualização Automática de Dados
A plataforma deve atualizar informações sem exigir recarregamento da página.
Implementar:
React Query
SWR
WebSockets
Server-Sent Events
Casos obrigatórios:
novas correções
atualização de notas
novas mensagens da IA
dashboards
notificações
Feedback Instantâneo
Toda ação do usuário deve gerar resposta imediata.
Exemplos:
Ao concluir uma atividade:
✓ Exercício corrigido
Ao enviar uma dúvida:
✓ Mensagem enviada para Katherine
Ao atualizar perfil:
✓ Dados salvos
Responsividade ao Toque
Mobile First obrigatório.
Todos os componentes devem seguir:
Área mínima de toque:
48px x 48px
Espaçamento mínimo:
8px entre elementos clicáveis
Gestos suportados:
toque
toque prolongado
swipe
pull-to-refresh
Evitar elementos pequenos difíceis de tocar.
Persistência de Dados
Nenhuma informação digitada deve ser perdida.
Implementar:
Salvamento automático (Auto Save)
Rascunhos automáticos
Recuperação de sessão
Exemplo:
Aluno escrevendo reflexão para IA Katherine.
A cada 5 segundos: Salvar automaticamente.
Navegação Inteligente
Ao executar uma ação relevante:
Evitar redirecionamentos desnecessários.
Exemplo:
Upload concluído
↓
Atualizar lista automaticamente
↓
Exibir confirmação
↓
Permanecer na mesma tela
Dashboards Reativos
Todos os dashboards devem atualizar automaticamente quando houver:
nova nota
nova correção
novo envio
nova atividade
Sem necessidade de atualizar a página.
Performance Percebida
Mesmo quando houver processamento pesado:
Utilizar:
Skeleton Loading
Optimistic Updates
Cache local
O usuário nunca deve sentir que o sistema está travado.
Arquitetura Front-End
Implementar utilizando:
React
Next.js
TypeScript
TailwindCSS
ShadCN UI
React Query
Zustand
Priorizar componentes desacoplados e reutilizáveis.
Critério de Aceitação
Todo componente criado deve responder à seguinte pergunta:"O usuário consegue perceber imediatamente o resultado da sua ação?". Se a resposta for não, a interação deve ser redesenhada.
