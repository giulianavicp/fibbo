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
Conceito e Tipografia
Nome e Símbolo: O nome "Fibbo" deriva da sequência de Fibonacci. O logo e a identidade devem remeter à Espiral de Ouro (Proporção Áurea), transmitindo precisão matemática, crescimento contínuo e lógica, mas com uma estética acolhedora.
Tipografia: Utilize uma fonte sem serifa (Sans-Serif), moderna, limpa e altamente legível (como Inter, Poppins ou Roboto), adequada para plataformas acadêmicas e leitura em telas mobile.
Esta é a logo oficial do projeto:

Paleta de Cores (Color Tokens) A interface deve ser "Clean" e evitar o uso de branco puro (#FFFFFF) para reduzir o cansaço visual, substituindo-o por tons de bege claros.
Cores Primárias:
Destaque Principal / Logo: Marrom escuro - #8C421B.
Fundo Geral (Background): Bege/Amarelo muito claro - #F1E1D4.
Tons Complementares (Escala Monocromática para componentes):
Claros: #FFEDD8, #F3D5B5, #E7BC91.
Médios: #D4A276, #BC8A5F, #A47148.
Escuros: #885E34, #6F4518.
Cores Semânticas (Feedback e Correção):
Sucesso / Correto (≥ 80%): Verde - #2F5E34.
Aviso / Parcial (≥ 60%): Amarelo - #FFAF03.
Erro / Incorreto (≤ 40%) e Erros de Login: Vermelho - #A61707.
3.3. Estilo de Interface (UI Components) A estética deve ser baseada em "Card UI" (informações contidas em cartões com bordas arredondadas e sombras suaves), similar à organização de plataformas como Notion e Canvas.
Iconografia: Estilo "Outline" (linhas finas e limpas). Utilizar estritamente referências geométricas e de desenho técnico para compor os menus: régua, compasso, esquadro, transferidor e gráficos de pizza.
Estados Vazios: Ilustrações amigáveis alinhadas à paleta de tons terrosos para guiar o usuário quando não houver dados.
3.4. Diferenciação de Acessos (Aluno vs. Professor) É crucial haver uma distinção visual clara entre os perfis. As cores de dentro do menu do aplicativo (pós-login) podem ser coloridas (contando que façam sentido e estejam dentro da proposta visual do site), facilitando o entendimento visual. Utilize a seguinte distribuição estrutural:
Interface do Professor (Foco Analítico e Gerencial):
Visual: Layout mais denso, focado em visualização de dados (Data Viz).
Elementos: Dashboards robustos estilo "KPI", com múltiplos painéis em uma única tela. Uso de gráficos de barras para comparar turmas, gráficos de rosca para engajamento e tabelas de notas. Menu lateral fixo (Sidebar).
Login de Teste: professor@fatec.sp.gov.br | Senha: senha-removida.
Interface do Aluno (Foco em Gamificação e Aprendizado):
Visual: "Mobile-First", interface mais limpa, acolhedora e minimalista, focada na jornada diária (estilo aplicativos de bem-estar ou trackers de hábitos).
Elementos: Dashboards simples com barras de progresso (percentual de curso/peso das notas), seções estilo "Diário" para reflexões guiadas pela IA Katherine, e placares de líderes (Leaderboards) sutis para gamificação. Navegação inferior (Bottom navigation) em telas móveis.
Login de Teste: aluno@fatec.sp.gov.br | Senha: senha-removida.
