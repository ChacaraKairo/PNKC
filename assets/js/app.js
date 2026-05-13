const STORAGE_KEY = "planopro_business_plan_v2";
const LEGACY_KEY = "plano_negocios_form_v1";
const MAX_LOGO_WIDTH = 900;
const MAX_ATTACHMENT_WIDTH = 1400;
const IMAGE_QUALITY = 0.78;
const KORU_LOGO_SRC = "assets/img/koru-company.jpg";
const COMPANY_SITE_URL = "https://korucompany.com.br";
const HIDDEN_PRINT_FIELDS = new Set(["reportPrimaryColor", "reportAccentColor"]);
const MONEY_FIELDS = new Set([
  "capitalInicial",
  "faturamentoEsperado",
  "investimentoTotal",
  "receitaBruta",
  "custosFixos",
  "custosVariaveis",
  "lucroLiquido",
  "capitalGiro"
]);
const PDF_TITLE = "Plano de Negócios — Koru Company";
let storageMode = "full";
let lastQuotaNoticeAt = 0;

const sections = [
  {
    id: "capa",
    title: "Capa",
    help: "Identifique o plano, a empresa e o responsável. A capa deve deixar claro o nome do negócio, local, ano e posicionamento.",
    fields: [
      { type: "logo", name: "logo", label: "Logo da empresa", help: "Imagem salva apenas neste navegador e incluída no relatório impresso." },
      { name: "nomeEmpresa", label: "Nome do projeto ou empresa", required: true, placeholder: "Ex.: Koru Company" },
      { name: "nomeFantasia", label: "Nome fantasia" },
      { name: "autor", label: "Autor/responsável", required: true },
      { name: "cidadeUf", label: "Cidade/UF", placeholder: "Ex.: São Paulo/SP" },
      { name: "ano", label: "Ano", inputType: "number", placeholder: "2026" },
      { name: "slogan", label: "Slogan ou frase de posicionamento", full: true },
      { name: "reportPrimaryColor", label: "Cor principal do PDF", inputType: "color", defaultValue: "#12343b" },
      { name: "reportAccentColor", label: "Cor de destaque do PDF", inputType: "color", defaultValue: "#197278" }
    ]
  },
  {
    id: "resumo",
    title: "Resumo executivo",
    help: "Síntese do plano. Os materiais de referência recomendam preencher por último, reunindo negócio, público, oferta, investimento e indicadores.",
    fields: [
      { name: "resumoNegocio", label: "Descrição curta do negócio", kind: "textarea", required: true, full: true, help: "Explique o que a empresa faz, qual problema resolve e por que a oportunidade existe." },
      { name: "publicoAlvo", label: "Público-alvo principal", kind: "textarea" },
      { name: "produtosServicos", label: "Produtos e serviços ofertados", kind: "textarea" },
      { name: "capitalInicial", label: "Capital inicial estimado", inputType: "number", step: "0.01" },
      { name: "faturamentoEsperado", label: "Expectativa de faturamento mensal", inputType: "number", step: "0.01" },
      { name: "expectativas", label: "Expectativas para o negócio", kind: "textarea", full: true },
      { name: "indicadoresResumo", label: "Principais indicadores de viabilidade", kind: "textarea", full: true, help: "Resuma ponto de equilíbrio, lucratividade, rentabilidade e prazo de retorno quando os números estiverem prontos." }
    ]
  },
  {
    id: "empresa",
    title: "Dados da empresa",
    help: "Reúna dados institucionais, setor de atuação, definição do negócio, missão, visão e valores.",
    fields: [
      { name: "razaoSocial", label: "Razão social" },
      { name: "cnpj", label: "CNPJ" },
      { name: "cnae", label: "CNAE/atividade principal" },
      { name: "porte", label: "Porte", kind: "select", options: ["", "MEI", "ME", "EPP", "Média empresa", "Outro"] },
      { name: "endereco", label: "Endereço ou local de operação", full: true },
      { name: "setor", label: "Setor de atividade", kind: "select", options: ["", "Serviços", "Comércio", "Indústria", "Agropecuária", "Tecnologia", "Outro"] },
      { name: "inicio", label: "Data prevista de início", inputType: "date" },
      { name: "definicaoNegocio", label: "Informações sobre o negócio", kind: "textarea", full: true, help: "Descreva modelo de negócio, fonte de receita, necessidades atendidas e cenário futuro." },
      { name: "missao", label: "Missão", kind: "textarea", full: true, help: "Declare a razão de existir da empresa e o valor entregue ao cliente." },
      { name: "visao", label: "Visão", kind: "textarea", full: true, help: "Onde o negócio quer chegar em médio e longo prazo." },
      { name: "valores", label: "Valores", kind: "textarea", full: true, help: "Princípios que guiam decisões, atendimento e cultura." }
    ]
  },
  {
    id: "socios",
    title: "Dados dos sócios e equipe",
    help: "Mapeie perfil, competências, participação e responsabilidades dos envolvidos.",
    tables: [
      { id: "sociosTable", title: "Sócios e responsáveis", columns: ["Nome", "Formação/experiência", "Responsabilidades", "Participação %", "Contato"] }
    ],
    fields: [
      { name: "equipeAtual", label: "Equipe atual", kind: "textarea", full: true },
      { name: "competenciasCriticas", label: "Competências críticas a desenvolver", kind: "textarea", full: true }
    ]
  },
  {
    id: "juridico",
    title: "Forma jurídica e tributária",
    help: "Defina constituição jurídica, enquadramento tributário, licenças e pontos que exigem validação contábil.",
    fields: [
      { name: "formaJuridica", label: "Forma jurídica", kind: "select", options: ["", "MEI", "Empresário Individual", "SLU", "Sociedade Limitada", "Sociedade Anônima", "Outra"] },
      { name: "tributario", label: "Enquadramento tributário", kind: "select", options: ["", "Simples Nacional", "Lucro Presumido", "Lucro Real", "A definir com contador"] },
      { name: "objetoSocial", label: "Objeto social / atividades", kind: "textarea", full: true },
      { name: "licencas", label: "Licenças, registros e alvarás necessários", kind: "textarea" },
      { name: "riscosLegais", label: "Riscos legais ou tributários", kind: "textarea" }
    ]
  },
  {
    id: "mercado",
    title: "Análise de mercado",
    help: "Investigue clientes, região, concorrentes, fornecedores, tendências e necessidades do mercado.",
    fields: [
      { name: "regiao", label: "Região de atuação" },
      { name: "nicho", label: "Nicho de mercado" },
      { name: "clientes", label: "Características dos clientes", kind: "textarea", full: true, help: "Inclua perfil, localização, hábitos de compra, dores e critérios de decisão." },
      { name: "persona", label: "Persona principal", kind: "textarea", full: true },
      { name: "problemaMercado", label: "Necessidade ou problema do mercado", kind: "textarea", full: true },
      { name: "tendencias", label: "Tendências e cenário futuro", kind: "textarea", full: true }
    ],
    tables: [
      { id: "concorrentesTable", title: "Concorrentes", columns: ["Concorrente", "Pontos fortes", "Pontos fracos", "Como vamos diferenciar"] },
      { id: "fornecedoresTable", title: "Fornecedores e parceiros", columns: ["Fornecedor/parceiro", "Produto/serviço", "Contato", "Importância"] }
    ]
  },
  {
    id: "marketing",
    title: "Proposta de valor, marketing e vendas",
    help: "Estruture posicionamento, canais, preço, promoção e relacionamento com clientes.",
    fields: [
      { name: "propostaValor", label: "Proposta de valor", kind: "textarea", required: true, full: true },
      { name: "posicionamento", label: "Posicionamento", kind: "textarea" },
      { name: "diferencial", label: "Diferencial competitivo", kind: "textarea" },
      { name: "preco", label: "Estratégia de preço", kind: "textarea" },
      { name: "canaisVenda", label: "Canais de venda e distribuição", kind: "textarea", help: "Ex.: site, WhatsApp, marketplace, loja física, representantes, parceiros." },
      { name: "promocao", label: "Promoção e divulgação", kind: "textarea" },
      { name: "jornada", label: "Jornada do cliente", kind: "textarea", full: true }
    ]
  },
  {
    id: "operacional",
    title: "Plano operacional",
    help: "Descreva estrutura necessária, equipe, equipamentos, softwares, processos internos e capacidade de atendimento.",
    fields: [
      { name: "localFuncionamento", label: "Local de funcionamento", kind: "textarea" },
      { name: "estruturaNecessaria", label: "Estrutura necessária", kind: "textarea" },
      { name: "equipamentos", label: "Equipamentos", kind: "textarea" },
      { name: "softwares", label: "Softwares e ferramentas", kind: "textarea" },
      { name: "equipe5anos", label: "Equipe necessária", kind: "textarea" },
      { name: "capacidade", label: "Capacidade produtiva ou de atendimento", kind: "textarea" },
      { name: "processosInternos", label: "Processos internos", kind: "textarea", full: true, help: "Detalhe da captação ao pós-venda: responsáveis, padrões de qualidade, prazos e controles." },
      { name: "processoOperacional", label: "Fluxo operacional principal", kind: "textarea", full: true }
    ]
  },
  {
    id: "financeiro",
    title: "Plano financeiro",
    help: "Informe estimativas para calcular viabilidade. Campos vazios e divisões por zero são tratados automaticamente.",
    layout: "three",
    fields: [
      { name: "investimentoTotal", label: "Investimento inicial total", inputType: "number", step: "0.01", calc: true, required: true },
      { name: "receitaBruta", label: "Receita prevista mensal", inputType: "number", step: "0.01", calc: true, required: true },
      { name: "custosFixos", label: "Custos fixos mensais", inputType: "number", step: "0.01", calc: true },
      { name: "custosVariaveis", label: "Custos variáveis mensais", inputType: "number", step: "0.01", calc: true },
      { name: "lucroLiquido", label: "Lucro líquido mensal", inputType: "number", step: "0.01", calc: true, help: "Receita menos custos, despesas e impostos estimados." },
      { name: "capitalGiro", label: "Capital de giro necessário", inputType: "number", step: "0.01" }
    ],
    finance: true,
    tables: [
      { id: "investimentosTable", title: "Investimentos iniciais", columns: ["Item", "Categoria", "Valor", "Observação"], numericColumn: 2 },
      { id: "custosFixosTable", title: "Detalhamento de custos fixos", columns: ["Item", "Valor mensal", "Observação"], numericColumn: 1 },
      { id: "custosVariaveisTable", title: "Detalhamento de custos variáveis", columns: ["Item", "Valor mensal", "Observação"], numericColumn: 1 },
      { id: "receitasTable", title: "Receitas previstas", columns: ["Produto/serviço", "Quantidade", "Preço médio", "Receita estimada"], numericColumn: 3 }
    ]
  },
  {
    id: "swot",
    title: "Análise SWOT",
    help: "Organize forças, fraquezas, oportunidades e ameaças para orientar decisões estratégicas.",
    fields: [
      { name: "forcas", label: "Forças", kind: "textarea" },
      { name: "fraquezas", label: "Fraquezas", kind: "textarea" },
      { name: "oportunidades", label: "Oportunidades", kind: "textarea" },
      { name: "ameacas", label: "Ameaças", kind: "textarea" },
      { name: "fatoresCriticos", label: "Fatores críticos de sucesso", kind: "textarea", full: true }
    ]
  },
  {
    id: "cronograma",
    title: "Cronograma de metas",
    help: "Transforme o plano em execução com prazos, responsáveis, status e próximos passos.",
    tables: [
      { id: "cronogramaTable", title: "Metas e atividades", columns: ["Meta/atividade", "Responsável", "Prazo", "Status", "Observações"], dateColumn: 2, selectColumn: 3, options: ["Planejado", "Em andamento", "Concluído", "Atrasado"] }
    ],
    fields: [
      { name: "acoesCurtoPrazo", label: "Ações a curto prazo", kind: "textarea", full: true }
    ]
  },
  {
    id: "anexos",
    title: "Anexos e imagens",
    help: "Inclua imagens de apoio, protótipos, fotos, organogramas, canvas ou outros materiais visuais.",
    fields: [
      { type: "attachments", name: "anexos", label: "Subir imagens dos anexos", help: "Use imagens leves para manter o JSON exportado prático." },
      { name: "observacoesFinais", label: "Observações finais", kind: "textarea", full: true }
    ]
  }
];

const detailedFieldHelp = {
  logo: "Use a marca visual da empresa, se ela ja existir. Prefira arquivo quadrado ou horizontal, com boa leitura em fundo claro. A logo aparecera no topo do relatorio impresso.",
  nomeEmpresa: "Informe o nome principal do negocio ou projeto. Use o nome que voce quer que apareca na capa e nos relatorios. Exemplo: Koru Company, Padaria Vila Nova ou App AgendaPro.",
  nomeFantasia: "Preencha se o negocio usa um nome comercial diferente da razao social. Se ainda nao houver nome fantasia definido, deixe em branco e volte depois.",
  autor: "Informe quem esta elaborando ou apresentando o plano. Pode ser o empreendedor, socio responsavel, consultor, grupo academico ou equipe do projeto.",
  cidadeUf: "Indique a cidade e o estado relacionados ao negocio ou ao local de apresentacao do plano. Exemplo: Curitiba/PR. Se o negocio for digital, use a cidade base da operacao.",
  ano: "Ano de elaboracao ou atualizacao do plano. Isso ajuda a controlar versoes, principalmente quando o plano for revisado no futuro.",
  slogan: "Escreva uma frase curta que resuma o posicionamento do negocio. Ela deve comunicar a promessa principal para o cliente. Exemplo: tecnologia simples para pequenos negocios venderem melhor.",
  reportPrimaryColor: "Escolha a cor principal do PDF. Ela sera usada em titulos, barras e detalhes do relatorio. Para manter identidade KORU, prefira verde escuro, verde azulado ou tons proximos da marca.",
  reportAccentColor: "Escolha a cor secundaria do PDF. Ela sera usada para destaques, linhas e pequenos detalhes visuais. Use uma cor que combine com a principal e mantenha boa leitura.",
  resumoNegocio: "Explique em poucos paragrafos o que e o negocio, qual problema ele resolve, para quem ele existe e como pretende gerar receita. O ideal e escrever esta parte por ultimo, depois de preencher mercado, operacao e financeiro.",
  publicoAlvo: "Descreva o grupo de clientes que o negocio pretende atender. Inclua perfil, localizacao, faixa de renda, comportamento, necessidades, dores e criterios de compra. Evite respostas genericas como todo mundo.",
  produtosServicos: "Liste o que sera vendido ou entregue. Explique cada produto ou servico em linguagem simples, destacando beneficio, formato de entrega, periodicidade e o que esta incluso.",
  capitalInicial: "Informe quanto dinheiro sera necessario para iniciar o negocio. Inclua abertura, estrutura, equipamentos, estoque, marketing inicial, tecnologia, taxas e reserva para os primeiros meses.",
  faturamentoEsperado: "Estime quanto o negocio pretende vender por mes quando estiver operando. Use uma premissa realista, baseada em quantidade de clientes, ticket medio e capacidade de atendimento.",
  expectativas: "Registre os principais objetivos do empreendedor. Exemplo: validar o mercado, alcancar 50 clientes, abrir uma loja fisica, contratar equipe, expandir para outra cidade ou atingir determinado faturamento.",
  indicadoresResumo: "Depois de preencher o financeiro, resuma os indicadores mais importantes: ponto de equilibrio, lucratividade, rentabilidade e prazo de retorno. Explique rapidamente se os numeros mostram viabilidade ou exigem ajuste.",
  razaoSocial: "Nome juridico da empresa registrado ou planejado. Se a empresa ainda nao estiver aberta, escreva a razao social pretendida ou marque que sera definida com contador.",
  cnpj: "Informe o CNPJ, se ja existir. Se o negocio ainda estiver em planejamento, deixe em branco ou registre que a formalizacao sera feita depois.",
  cnae: "CNAE e a classificacao da atividade economica. Preencha com o codigo ou descricao principal da atividade. Confirme com contador, pois isso impacta tributacao e permissao de atividades.",
  porte: "Selecione o porte esperado da empresa. MEI, ME e EPP possuem limites e regras diferentes. Se tiver duvida, escolha a opcao mais proxima e valide com contador.",
  endereco: "Informe onde o negocio funcionara: endereco fisico, escritorio, home office, loja, ponto comercial, coworking ou operacao online. Se houver varias unidades, descreva cada uma.",
  setor: "Escolha o setor predominante do negocio. Essa classificacao ajuda a orientar analise de mercado, tributacao, operacao e comparacao com concorrentes.",
  inicio: "Data prevista para inicio das atividades. Use uma estimativa realista considerando formalizacao, estrutura, compra de equipamentos, equipe e divulgacao.",
  definicaoNegocio: "Descreva o modelo de negocio: o que sera vendido, como o cliente compra, como a empresa entrega, quais sao as fontes de receita e quais necessidades do mercado serao atendidas.",
  missao: "Missao e a razao de existir da empresa. Responda: o que fazemos, para quem fazemos e qual valor entregamos. Deve ser clara, objetiva e ligada ao beneficio para o cliente.",
  visao: "Visao e onde a empresa quer chegar em alguns anos. Descreva uma ambicao concreta, como ser referencia regional, atingir certo numero de clientes ou ampliar linhas de produto.",
  valores: "Valores sao principios que orientam atitudes e decisoes. Inclua apenas valores que a empresa pretende praticar de verdade, como transparencia, qualidade, agilidade, etica ou inovacao.",
  equipeAtual: "Descreva quem ja participa do negocio hoje, mesmo que informalmente. Informe funcoes, disponibilidade, responsabilidades e lacunas existentes na equipe.",
  competenciasCriticas: "Liste conhecimentos ou habilidades que o negocio precisa desenvolver para funcionar bem. Exemplo: vendas, gestao financeira, atendimento, tecnologia, marketing, producao ou logistica.",
  formaJuridica: "Escolha a forma legal planejada para a empresa. Essa decisao afeta responsabilidade dos socios, impostos, limite de faturamento e obrigacoes legais. Valide com contador antes de abrir.",
  tributario: "Selecione o regime tributario previsto. Ele define como impostos serao calculados e pagos. Caso ainda nao saiba, marque que sera definido com contador.",
  objetoSocial: "Descreva as atividades que a empresa podera exercer legalmente. Escreva de forma objetiva, alinhada aos produtos e servicos oferecidos.",
  licencas: "Informe alvaras, registros, autorizacoes ou licencas necessarias para operar. Exemplo: vigilancia sanitaria, prefeitura, conselho profissional, bombeiros, registro de marca ou licenca ambiental.",
  riscosLegais: "Liste pontos juridicos ou tributarios que podem gerar problema. Exemplo: uso de dados pessoais, contratos, direitos autorais, normas sanitarias, enquadramento incorreto ou exigencias municipais.",
  regiao: "Defina onde a empresa atuara: bairro, cidade, estado, Brasil inteiro ou mercado internacional. Para negocios online, explique a abrangencia geografica de venda e atendimento.",
  nicho: "Nicho e o recorte especifico dentro do mercado. Exemplo: roupas sustentaveis para mulheres de 25 a 40 anos, consultoria financeira para MEIs ou comida saudavel por assinatura.",
  clientes: "Descreva quem compra, quem usa e quem decide a compra. Inclua necessidades, renda, habitos, frequencia de compra, canais preferidos e fatores que fazem o cliente escolher uma solucao.",
  persona: "Crie um personagem semificticio que represente o cliente ideal. Inclua nome, idade, rotina, dores, objetivos, objecoes, como pesquisa solucoes e o que valoriza na compra.",
  problemaMercado: "Explique a dor ou necessidade que justifica o negocio. Mostre por que as opcoes atuais nao resolvem bem e qual oportunidade existe para entregar algo melhor.",
  tendencias: "Registre mudancas de comportamento, tecnologia, economia, regulacao ou consumo que podem favorecer ou ameacar o negocio nos proximos anos.",
  propostaValor: "Explique por que o cliente escolheria sua empresa. Relacione problema, solucao, beneficio concreto e diferencial. Uma boa proposta de valor e especifica e facil de entender.",
  posicionamento: "Defina como a marca quer ser percebida no mercado: economica, premium, rapida, especializada, local, inovadora, artesanal, consultiva ou outra posicao clara.",
  diferencial: "Liste elementos que tornam o negocio diferente ou melhor que alternativas. Pode ser atendimento, tecnologia, preco, qualidade, prazo, experiencia, especializacao ou relacionamento.",
  preco: "Explique como os precos serao definidos. Considere custos, margem desejada, valor percebido, concorrencia, descontos, pacotes, mensalidades e condicoes de pagamento.",
  canaisVenda: "Informe por onde o cliente podera comprar ou contratar. Exemplo: loja fisica, site, WhatsApp, Instagram, marketplace, representantes, parceiros ou vendas consultivas.",
  promocao: "Descreva como o negocio sera divulgado. Inclua canais, campanhas, conteudos, parcerias, indicacoes, anuncios, eventos e estrategias para gerar conhecimento e demanda.",
  jornada: "Mapeie o caminho do cliente: como descobre a empresa, como compara opcoes, como compra, como recebe o produto ou servico, como e atendido e como volta a comprar.",
  localFuncionamento: "Explique onde as atividades acontecem e por que esse local e adequado. Considere acesso de clientes, fornecedores, equipe, custo, infraestrutura e possibilidade de expansao.",
  estruturaNecessaria: "Liste o que precisa existir para operar: espaco fisico, mobiliario, internet, energia, estoque, maquinas, sistemas, veiculos, atendimento, seguranca e organizacao.",
  equipamentos: "Relacione equipamentos essenciais e desejaveis. Informe quantidade, finalidade e prioridade. Exemplo: computadores, impressoras, maquinas, ferramentas, moveis ou equipamentos de producao.",
  softwares: "Liste sistemas e ferramentas digitais necessarios. Exemplo: controle financeiro, CRM, emissor de nota, e-commerce, agenda, design, atendimento, automacao ou planilhas.",
  equipe5anos: "Descreva como a equipe deve evoluir. Inclua cargos futuros, contratacoes prioritarias, terceirizacoes, liderancas e competencias necessarias para crescer.",
  capacidade: "Informe quanto a empresa consegue produzir, vender ou atender em determinado periodo. Exemplo: clientes por mes, pedidos por dia, projetos por trimestre ou unidades fabricadas.",
  processosInternos: "Detalhe as rotinas internas que mantem a empresa funcionando: vendas, atendimento, producao, entrega, financeiro, compras, estoque, qualidade, suporte e pos-venda.",
  processoOperacional: "Descreva o fluxo principal do trabalho em ordem. Comece na entrada do pedido ou captacao do cliente e termine na entrega, cobranca, suporte e acompanhamento.",
  investimentoTotal: "Some todos os valores necessarios para iniciar: reformas, equipamentos, estoque inicial, sistemas, taxas, marketing, capital de giro e reserva. Use numeros realistas.",
  receitaBruta: "Informe o total de vendas previsto por mes antes de descontar custos, despesas e impostos. Calcule multiplicando quantidade esperada pelo preco medio.",
  custosFixos: "Custos fixos sao gastos que acontecem mesmo vendendo pouco ou nada. Exemplo: aluguel, salarios, internet, contador, sistemas, energia minima e mensalidades.",
  custosVariaveis: "Custos variaveis aumentam ou diminuem conforme as vendas. Exemplo: materia-prima, comissoes, taxas de cartao, embalagens, frete, impostos sobre venda e insumos.",
  lucroLiquido: "Informe o resultado esperado depois de descontar custos, despesas e impostos. Se ainda nao souber, estime com cuidado e atualize apos detalhar receitas e gastos.",
  capitalGiro: "Capital de giro e o dinheiro necessario para manter a operacao entre pagamentos e recebimentos. Inclua estoque, prazo de clientes, despesas mensais e reserva de seguranca.",
  forcas: "Forcas sao vantagens internas do negocio, ou seja, pontos que dependem da empresa. Exemplo: equipe experiente, tecnologia propria, localizacao, reputacao ou baixo custo.",
  fraquezas: "Fraquezas sao limitacoes internas que precisam ser melhoradas. Exemplo: pouca experiencia em vendas, capital limitado, dependencia de fornecedor ou falta de processos.",
  oportunidades: "Oportunidades sao fatores externos favoraveis. Exemplo: crescimento do mercado, novas tecnologias, mudanca de comportamento, incentivos, parcerias ou baixa concorrencia local.",
  ameacas: "Ameacas sao fatores externos que podem prejudicar o negocio. Exemplo: novos concorrentes, alta de custos, mudanca legal, queda de demanda ou dependencia de plataforma.",
  fatoresCriticos: "Liste condicoes que precisam dar certo para o negocio ser sustentavel. Exemplo: conquistar clientes recorrentes, controlar custos, manter qualidade, entregar no prazo ou formar equipe.",
  acoesCurtoPrazo: "Descreva as primeiras acoes praticas para tirar o plano do papel nos proximos 30, 60 ou 90 dias. Inclua prioridade, responsavel e resultado esperado.",
  anexos: "Adicione imagens que ajudem a comprovar ou explicar o plano: logo, fotos do ponto, prototipos, canvas, organograma, layout, produtos, cardapio, mockups ou pesquisas.",
  observacoesFinais: "Use este campo para registrar pontos importantes que nao se encaixaram nas etapas anteriores, pendencias, premissas usadas, fontes de informacao ou decisoes futuras."
};

const detailedTableHelp = {
  sociosTable: "Use uma linha por socio, fundador ou pessoa-chave. Preencha formacao, experiencia, atribuicoes, participacao e contato para deixar claro quem faz o que no negocio.",
  concorrentesTable: "Inclua concorrentes diretos e indiretos. Compare pontos fortes, pontos fracos e como sua empresa pretende se diferenciar de forma concreta.",
  fornecedoresTable: "Liste fornecedores essenciais e parceiros estrategicos. Informe o que fornecem, como contatar e por que sao importantes para a operacao.",
  investimentosTable: "Detalhe todos os gastos de abertura. Separe itens como equipamentos, reformas, estoque, marketing inicial, sistemas, taxas e reserva.",
  custosFixosTable: "Registre despesas mensais recorrentes que existem mesmo sem vendas. Esse detalhamento ajuda a validar o campo de custos fixos mensais.",
  custosVariaveisTable: "Registre gastos ligados diretamente a cada venda ou entrega. Esse detalhamento ajuda a calcular margem de contribuicao e ponto de equilibrio.",
  receitasTable: "Liste as fontes de receita previstas. Use quantidade, preco medio e receita estimada para justificar a previsao de faturamento mensal.",
  cronogramaTable: "Transforme o plano em execucao. Cada linha deve ter uma meta ou atividade clara, responsavel, prazo, status e observacoes sobre dependencia ou proximo passo."
};

function enrichGuidance() {
  sections.forEach((section) => {
    (section.fields || []).forEach((field) => {
      if (detailedFieldHelp[field.name]) field.help = detailedFieldHelp[field.name];
    });

    (section.tables || []).forEach((table) => {
      if (detailedTableHelp[table.id]) table.help = detailedTableHelp[table.id];
    });
  });
}

enrichGuidance();

let state = normalizeState(readStoredState());
let currentStep = 0;
let dirty = false;
let noticeTimer;

const form = document.getElementById("planForm");
const stepList = document.getElementById("stepList");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

function normalizeState(raw) {
  return {
    version: 2,
    updatedAt: raw?.updatedAt || null,
    fields: raw?.fields || {},
    tables: raw?.tables || {},
    images: {
      logo: raw?.images?.logo || null,
      anexos: Array.isArray(raw?.images?.anexos) ? raw.images.anexos : []
    }
  };
}

function readStoredState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || JSON.parse(localStorage.getItem(LEGACY_KEY)) || {};
  } catch {
    return {};
  }
}

function saveState(showMessage = false) {
  collectFields();
  state.updatedAt = new Date().toISOString();
  const saved = persistState();
  dirty = !saved;
  updateProgress();
  if (showMessage && saved) showNotice("Rascunho salvo neste navegador.", "success");
  return saved;
}

function persistState() {
  if (!state.images.logo && state.images.anexos.length === 0) storageMode = "full";
  const payload = storageMode === "full" ? state : createTextOnlyState();

  try {
    localStorage.removeItem(LEGACY_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    if (!isQuotaExceeded(error)) {
      notifyStorageFailure("Não foi possível salvar o rascunho neste navegador.");
      return false;
    }

    try {
      storageMode = "text-only";
      localStorage.removeItem(LEGACY_KEY);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createTextOnlyState()));
      notifyStorageFailure("O navegador atingiu o limite de armazenamento. O texto foi salvo, mas as imagens não cabem no rascunho local. Remova anexos grandes ou exporte o JSON para guardar uma cópia completa.");
      return true;
    } catch {
      notifyStorageFailure("O navegador não conseguiu salvar porque o armazenamento local está cheio. Exporte o JSON e remova imagens grandes para continuar com autosave.");
      return false;
    }
  }
}

function createTextOnlyState() {
  return {
    ...state,
    images: {
      logo: null,
      anexos: []
    },
    storageWarning: "Imagens omitidas do autosave local por limite de armazenamento do navegador."
  };
}

function isQuotaExceeded(error) {
  return error?.name === "QuotaExceededError" || error?.code === 22 || error?.code === 1014;
}

function notifyStorageFailure(message) {
  const now = Date.now();
  if (now - lastQuotaNoticeAt < 4000) return;
  lastQuotaNoticeAt = now;
  showNotice(message, "error");
}

function collectFields() {
  form.querySelectorAll("[data-field]").forEach((field) => {
    state.fields[field.dataset.field] = field.value;
  });
}

function getField(name) {
  return state.fields[name] || "";
}

function isFilled(value) {
  return String(value || "").trim().length > 0;
}

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function percent(value) {
  if (!Number.isFinite(value)) return "0,00%";
  return `${value.toFixed(2).replace(".", ",")}%`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function renderApp() {
  renderSteps();
  renderForm();
  bindEvents();
  setCurrentStep(findFirstStartedStep());
  updateProgress();
  updateFinancialCards();
}

function renderSteps() {
  stepList.innerHTML = sections.map((section, index) => `
    <button class="step-link" type="button" data-step="${index}">
      <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="step-title">${section.title}</span>
      <span class="step-state">Pendente</span>
    </button>
  `).join("");
}

function renderForm() {
  form.innerHTML = sections.map((section, index) => `
    <section class="form-step" id="${section.id}" data-section="${section.id}" aria-labelledby="${section.id}Title">
      <div class="section-head">
        <div>
          <h3 id="${section.id}Title">${index + 1}. ${section.title}</h3>
          <p>${section.help}</p>
        </div>
        <span class="section-badge">Etapa ${index + 1}/${sections.length}</span>
      </div>
      ${renderFields(section)}
      ${section.finance ? renderFinanceCards() : ""}
      ${(section.tables || []).map(renderTableBlock).join("")}
    </section>
  `).join("");

  sections.forEach((section) => {
    (section.tables || []).forEach((table) => {
      if (!state.tables[table.id]) state.tables[table.id] = [emptyRow(table)];
      if (state.tables[table.id].length === 0) state.tables[table.id].push(emptyRow(table));
      renderTableRows(table);
    });
  });
  renderImages();
  markFilledFields();
}

function renderFields(section) {
  if (!section.fields?.length) return "";
  return `<div class="field-grid ${section.layout === "three" ? "three" : ""}">
    ${section.fields.map(renderField).join("")}
  </div>`;
}

function renderField(field) {
  if (field.type === "logo") {
    return `
      <div class="upload-block">
        <label for="logoInput">${field.label}</label>
        <input id="logoInput" type="file" accept="image/*">
        <p class="help-text">${field.help}</p>
        <div class="logo-preview" id="logoPreview">LOGO</div>
      </div>`;
  }

  if (field.type === "attachments") {
    return `
      <div class="upload-block">
        <label for="attachmentInput">${field.label}</label>
        <input id="attachmentInput" type="file" accept="image/*" multiple>
        <p class="help-text">${field.help}</p>
        <div class="attachments-grid" id="attachmentsGrid"></div>
      </div>`;
  }

  const id = `field-${field.name}`;
  const tag = field.kind === "textarea" ? "textarea" : field.kind === "select" ? "select" : "input";
  const required = field.required ? "required" : "";
  const fieldClass = `field ${field.full ? "full" : ""} ${field.required ? "required" : ""}`;
  const common = `id="${id}" data-field="${field.name}" ${required}`;
  const status = field.required ? `<span class="field-status">Obrigatório</span>` : `<span class="field-status">Opcional</span>`;
  let control = "";

  if (tag === "textarea") {
    control = `<textarea ${common} placeholder="${field.placeholder || ""}">${escapeHtml(getField(field.name))}</textarea>`;
  } else if (tag === "select") {
    control = `<select ${common}>${field.options.map((option) => `<option ${getField(field.name) === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  } else {
    const value = getField(field.name) || field.defaultValue || "";
    control = `<input ${common} type="${field.inputType || "text"}" step="${field.step || ""}" value="${escapeHtml(value)}" placeholder="${field.placeholder || ""}" ${field.calc ? "data-calc" : ""}>`;
  }

  return `
    <div class="${fieldClass}">
      <label for="${id}"><span>${field.label}</span>${status}</label>
      ${control}
      ${field.help ? `<p class="help-text">${field.help}</p>` : ""}
    </div>`;
}

function renderFinanceCards() {
  return `
    <div class="finance-results" aria-label="Indicadores financeiros">
      <div class="finance-card"><strong>Ponto de equilíbrio</strong><span id="pontoEquilibrio">R$ 0,00</span><p>Receita mínima para cobrir custos fixos e variáveis, sem lucro nem prejuízo.</p></div>
      <div class="finance-card"><strong>Lucratividade</strong><span id="lucratividade">0,00%</span><p>Percentual da receita que vira lucro líquido no mês.</p></div>
      <div class="finance-card"><strong>Rentabilidade</strong><span id="rentabilidade">0,00%</span><p>Retorno mensal do lucro líquido sobre o investimento inicial.</p></div>
      <div class="finance-card"><strong>Prazo de retorno</strong><span id="retorno">Indefinido</span><p>Tempo estimado para recuperar o investimento inicial.</p></div>
    </div>`;
}

function renderTableBlock(table) {
  return `
    <div class="table-block">
      <div class="table-head">
        <h4>${table.title}</h4>
        <button class="button ghost" type="button" data-add-row="${table.id}">Adicionar linha</button>
      </div>
      ${table.help ? `<p class="table-help">${table.help}</p>` : ""}
      <div class="table-wrap">
        <table id="${table.id}">
          <thead><tr>${table.columns.map((column) => `<th>${column}</th>`).join("")}<th>Ações</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>`;
}

function renderTableRows(table) {
  const tbody = document.querySelector(`#${table.id} tbody`);
  if (!tbody) return;
  tbody.innerHTML = "";
  (state.tables[table.id] || []).forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    table.columns.forEach((column, columnIndex) => {
      const td = document.createElement("td");
      const input = createTableInput(table, rowIndex, columnIndex);
      input.setAttribute("aria-label", `${column} - linha ${rowIndex + 1}`);
      td.appendChild(input);
      tr.appendChild(td);
    });
    const actionTd = document.createElement("td");
    actionTd.innerHTML = `<button class="button danger" type="button" data-remove-row="${table.id}" data-row="${rowIndex}">Remover</button>`;
    tr.appendChild(actionTd);
    tbody.appendChild(tr);
  });
}

function createTableInput(table, rowIndex, columnIndex) {
  const longColumn = /observa|respons|experi|fortes|fracos|diferenciar/i.test(table.columns[columnIndex]);
  const input = document.createElement(longColumn ? "textarea" : "input");
  input.value = state.tables[table.id][rowIndex][columnIndex] || "";
  input.dataset.table = table.id;
  input.dataset.row = rowIndex;
  input.dataset.column = columnIndex;
  if (table.dateColumn === columnIndex) input.type = "date";
  else if (table.numericColumn === columnIndex) {
    input.type = "number";
    input.step = "0.01";
  } else if (input.tagName === "INPUT") {
    input.type = "text";
  }

  if (table.selectColumn === columnIndex) {
    const select = document.createElement("select");
    select.dataset.table = table.id;
    select.dataset.row = rowIndex;
    select.dataset.column = columnIndex;
    select.setAttribute("aria-label", `${table.columns[columnIndex]} - linha ${rowIndex + 1}`);
    select.innerHTML = ["", ...(table.options || [])].map((option) => `<option ${state.tables[table.id][rowIndex][columnIndex] === option ? "selected" : ""}>${option}</option>`).join("");
    return select;
  }

  return input;
}

function emptyRow(table) {
  return table.columns.map(() => "");
}

function findTableConfig(tableId) {
  for (const section of sections) {
    const table = (section.tables || []).find((item) => item.id === tableId);
    if (table) return table;
  }
  return null;
}

function bindEvents() {
  stepList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step]");
    if (button) setCurrentStep(Number(button.dataset.step));
  });

  form.addEventListener("input", (event) => {
    if (event.target.matches("[data-field]")) {
      dirty = true;
      saveState();
      markFilledFields();
      updateFinancialCards();
    }

    if (event.target.matches("[data-table]")) {
      const { table, row, column } = event.target.dataset;
      state.tables[table][Number(row)][Number(column)] = event.target.value;
      dirty = true;
      saveState();
      updateFinancialCards();
    }
  });

  form.addEventListener("change", (event) => {
    if (event.target.matches("[data-field]")) {
      dirty = true;
      saveState();
      markFilledFields();
      updateFinancialCards();
    }

    if (event.target.matches("[data-table]")) {
      const { table, row, column } = event.target.dataset;
      state.tables[table][Number(row)][Number(column)] = event.target.value;
      dirty = true;
      saveState();
      updateFinancialCards();
    }

    if (event.target.id === "logoInput") handleLogoUpload(event.target.files[0]);
    if (event.target.id === "attachmentInput") handleAttachments(event.target.files, event.target);
  });

  form.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-row]");
    const remove = event.target.closest("[data-remove-row]");
    if (add) {
      addTableRow(add.dataset.addRow);
      buttonFeedback(add, "success", "Adicionado");
    }
    if (remove) {
      removeTableRow(remove.dataset.removeRow, Number(remove.dataset.row));
      buttonFeedback(remove, "success", "Removido");
    }
  });

  document.getElementById("nextButton").addEventListener("click", nextStep);
  document.getElementById("bottomNextButton").addEventListener("click", nextStep);
  document.getElementById("prevButton").addEventListener("click", prevStep);
  document.getElementById("bottomPrevButton").addEventListener("click", prevStep);
  document.getElementById("saveButton").addEventListener("click", (event) => {
    if (saveState(true)) {
      buttonFeedback(event.currentTarget, "success", "Salvo");
    } else {
      buttonFeedback(event.currentTarget, "error", "Erro");
    }
  });
  document.getElementById("exportButton").addEventListener("click", (event) => exportJSON(event.currentTarget));
  document.getElementById("importFile").addEventListener("change", importJSON);
  document.getElementById("printButton").addEventListener("click", (event) => printReport(event.currentTarget));
  document.getElementById("clearButton").addEventListener("click", (event) => clearAll(event.currentTarget));
  document.getElementById("continueButton").addEventListener("click", (event) => {
    document.getElementById("workspace").scrollIntoView({ behavior: "smooth" });
    buttonFeedback(event.currentTarget, "success", "Abrindo");
  });
  window.addEventListener("beforeprint", buildPrintReport);

  window.addEventListener("beforeunload", (event) => {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

function setCurrentStep(index) {
  currentStep = Math.max(0, Math.min(index, sections.length - 1));
  document.querySelectorAll(".form-step").forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === currentStep));
  document.querySelectorAll(".step-link").forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === currentStep));
  document.getElementById("currentStepTitle").textContent = sections[currentStep].title;
  document.getElementById("prevButton").disabled = currentStep === 0;
  document.getElementById("bottomPrevButton").disabled = currentStep === 0;
  document.getElementById("nextButton").textContent = currentStep === sections.length - 1 ? "Concluir" : "Próxima etapa";
  document.getElementById("bottomNextButton").textContent = document.getElementById("nextButton").textContent;
  updateProgress();
}

function nextStep() {
  if (!saveState(true)) {
    buttonFeedback(document.getElementById("nextButton"), "error", "Erro");
    buttonFeedback(document.getElementById("bottomNextButton"), "error", "Erro");
    return;
  }

  const missing = requiredMissingInCurrentStep();
  if (missing.length) {
    showNotice(`Revise os campos obrigatórios desta etapa: ${missing.join(", ")}.`, "error");
    buttonFeedback(document.getElementById("nextButton"), "error", "Revise");
    buttonFeedback(document.getElementById("bottomNextButton"), "error", "Revise");
    return;
  }
  buttonFeedback(document.getElementById("nextButton"), "success", currentStep < sections.length - 1 ? "OK" : "Salvo");
  buttonFeedback(document.getElementById("bottomNextButton"), "success", currentStep < sections.length - 1 ? "OK" : "Salvo");
  if (currentStep < sections.length - 1) setCurrentStep(currentStep + 1);
  else showNotice("Plano salvo. Você já pode exportar ou imprimir o relatório.", "success");
}

function prevStep() {
  saveState();
  buttonFeedback(document.getElementById("prevButton"), "success", "OK");
  buttonFeedback(document.getElementById("bottomPrevButton"), "success", "OK");
  setCurrentStep(currentStep - 1);
}

function requiredMissingInCurrentStep() {
  return (sections[currentStep].fields || [])
    .filter((field) => field.required && !isFilled(getField(field.name)))
    .map((field) => field.label);
}

function addTableRow(tableId) {
  const table = findTableConfig(tableId);
  state.tables[tableId].push(emptyRow(table));
  renderTableRows(table);
  saveState();
  showNotice("Linha adicionada com sucesso.", "success");
}

function removeTableRow(tableId, rowIndex) {
  const table = findTableConfig(tableId);
  state.tables[tableId].splice(rowIndex, 1);
  if (state.tables[tableId].length === 0) state.tables[tableId].push(emptyRow(table));
  renderTableRows(table);
  saveState();
  showNotice("Linha removida com sucesso.", "success");
}

function compressImageFile(file, maxWidth) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Arquivo inválido."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleLogoUpload(file) {
  if (!file) return;
  try {
    state.images.logo = await compressImageFile(file, MAX_LOGO_WIDTH);
    storageMode = "full";
    saveState(true);
    renderImages();
    showNotice("Logo enviada e otimizada com sucesso.", "success");
  } catch {
    showNotice("Não foi possível carregar a logo.", "error");
  }
}

async function handleAttachments(files, input) {
  try {
    for (const file of Array.from(files || [])) {
      state.images.anexos.push(await compressImageFile(file, MAX_ATTACHMENT_WIDTH));
    }
    storageMode = "full";
    input.value = "";
    saveState(true);
    renderImages();
    showNotice("Anexo enviado e otimizado com sucesso.", "success");
  } catch {
    showNotice("Não foi possível carregar o anexo.", "error");
  }
}

function renderImages() {
  const logoPreview = document.getElementById("logoPreview");
  if (logoPreview) {
    logoPreview.innerHTML = state.images.logo ? `<img src="${state.images.logo}" alt="Logo da empresa">` : "LOGO";
  }

  const grid = document.getElementById("attachmentsGrid");
  if (!grid) return;
  grid.innerHTML = (state.images.anexos || []).map((image, index) => `
    <article class="attachment-card">
      <div class="attachment-thumb"><img src="${image}" alt="Anexo ${index + 1}"></div>
      <div class="row-actions"><button class="button danger" type="button" data-remove-image="${index}">Remover</button></div>
    </article>
  `).join("");
  grid.querySelectorAll("[data-remove-image]").forEach((button) => {
    button.addEventListener("click", () => {
      state.images.anexos.splice(Number(button.dataset.removeImage), 1);
      storageMode = "full";
      saveState();
      renderImages();
      showNotice("Imagem removida com sucesso.", "success");
      buttonFeedback(button, "success", "Removido");
    });
  });
}

function updateFinancialCards() {
  collectFields();
  const receita = Number(state.fields.receitaBruta || 0);
  const lucro = Number(state.fields.lucroLiquido || 0);
  const investimento = Number(state.fields.investimentoTotal || 0);
  const fixos = Number(state.fields.custosFixos || 0);
  const variaveis = Number(state.fields.custosVariaveis || 0);
  const margemContribuicao = receita - variaveis;
  const indiceMargem = receita > 0 ? margemContribuicao / receita : 0;
  const ponto = indiceMargem > 0 ? fixos / indiceMargem : 0;
  const lucratividade = receita > 0 ? (lucro / receita) * 100 : 0;
  const rentabilidade = investimento > 0 ? (lucro / investimento) * 100 : 0;
  const retorno = lucro > 0 ? investimento / lucro : 0;

  setText("pontoEquilibrio", indiceMargem > 0 ? money(ponto) : "Indefinido");
  setText("lucratividade", percent(lucratividade));
  setText("rentabilidade", percent(rentabilidade));
  setText("retorno", retorno > 0 && Number.isFinite(retorno) ? `${retorno.toFixed(1).replace(".", ",")} meses` : "Indefinido");
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function markFilledFields() {
  form.querySelectorAll("[data-field]").forEach((field) => field.classList.toggle("filled", isFilled(field.value)));
}

function updateProgress() {
  collectFields();
  const allFields = sections.flatMap((section) => section.fields || []).filter((field) => !field.type);
  const filledFields = allFields.filter((field) => isFilled(state.fields[field.name])).length;
  let tableCells = 0;
  let filledTableCells = 0;

  Object.values(state.tables).forEach((rows) => {
    rows.forEach((row) => row.forEach((cell) => {
      tableCells += 1;
      if (isFilled(cell)) filledTableCells += 1;
    }));
  });

  const imageTotal = 2;
  const imageFilled = (state.images.logo ? 1 : 0) + (state.images.anexos.length ? 1 : 0);
  const total = allFields.length + tableCells + imageTotal;
  const filled = filledFields + filledTableCells + imageFilled;
  const progress = Math.min(100, Math.round((filled / Math.max(total, 1)) * 100));
  const startedSections = sections.filter((section) => sectionHasContent(section)).length;

  progressText.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
  setText("homeProgress", `${progress}%`);
  setText("homeSections", `${startedSections}/${sections.length}`);
  setText("homeSaved", state.updatedAt ? new Date(state.updatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "Ainda não salvo");
  setText("stepSummary", `${startedSections} de ${sections.length} etapas iniciadas.`);

  document.querySelectorAll(".step-link").forEach((button, index) => {
    const section = sections[index];
    const complete = sectionCompletion(section) >= 0.75;
    const missing = (section.fields || []).some((field) => field.required && !isFilled(state.fields[field.name]));
    button.classList.toggle("complete", complete);
    button.classList.toggle("required-missing", missing);
    button.querySelector(".step-state").textContent = complete ? "OK" : missing ? "Obrig." : sectionHasContent(section) ? "Em curso" : "Pendente";
  });
}

function sectionHasContent(section) {
  const fieldContent = (section.fields || []).some((field) => field.type === "logo" ? state.images.logo : field.type === "attachments" ? state.images.anexos.length : isFilled(state.fields[field.name]));
  const tableContent = (section.tables || []).some((table) => (state.tables[table.id] || []).some((row) => row.some(isFilled)));
  return fieldContent || tableContent;
}

function sectionCompletion(section) {
  let total = 0;
  let filled = 0;
  (section.fields || []).forEach((field) => {
    total += 1;
    if (field.type === "logo" && state.images.logo) filled += 1;
    else if (field.type === "attachments" && state.images.anexos.length) filled += 1;
    else if (!field.type && isFilled(state.fields[field.name])) filled += 1;
  });
  (section.tables || []).forEach((table) => {
    (state.tables[table.id] || []).forEach((row) => row.forEach((cell) => {
      total += 1;
      if (isFilled(cell)) filled += 1;
    }));
  });
  return total ? filled / total : 0;
}

function findFirstStartedStep() {
  const index = sections.findIndex(sectionHasContent);
  return index >= 0 ? index : 0;
}

function showNotice(message, type = "success") {
  const notice = document.getElementById("notice");
  notice.textContent = message;
  notice.className = `notice show ${type}`;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.className = "notice", 4200);
}

function buttonFeedback(button, type, label) {
  if (!button) return;
  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.classList.remove("feedback-success", "feedback-error");
  button.classList.add(type === "success" ? "feedback-success" : "feedback-error");
  button.textContent = label;
  window.setTimeout(() => {
    button.classList.remove("feedback-success", "feedback-error");
    button.textContent = originalText;
  }, 1800);
}

function exportJSON(button) {
  try {
    saveState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const company = slug(getField("nomeEmpresa") || "plano-de-negocios");
    link.href = url;
    link.download = `${company}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Arquivo JSON exportado com sucesso.", "success");
    buttonFeedback(button, "success", "Exportado");
  } catch {
    showNotice("Não foi possível exportar o JSON.", "error");
    buttonFeedback(button, "error", "Erro");
  }
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(reader.result));
      state.updatedAt = new Date().toISOString();
      storageMode = "full";
      if (!persistState()) throw new Error("Falha ao salvar importação.");
      dirty = false;
      renderForm();
      setCurrentStep(findFirstStartedStep());
      showNotice("Plano importado com sucesso.", "success");
      buttonFeedback(document.querySelector("label[for='importFile']"), "success", "Importado");
    } catch {
      showNotice("Arquivo JSON inválido.", "error");
      buttonFeedback(document.querySelector("label[for='importFile']"), "error", "Erro");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function clearAll(button) {
  const confirmed = window.confirm("Tem certeza que deseja apagar todos os dados salvos neste navegador?");
  if (!confirmed) {
    showNotice("Limpeza cancelada. Seus dados foram mantidos.", "success");
    buttonFeedback(button, "success", "Mantido");
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
  storageMode = "full";
  state = normalizeState({});
  renderForm();
  setCurrentStep(0);
  updateProgress();
  showNotice("Dados locais apagados.", "success");
  buttonFeedback(button, "success", "Limpo");
}

function printReport(button) {
  try {
    saveState();
    buildPrintReport();
    document.body.classList.add("document-preview-active");
    document.getElementById("printReport").scrollIntoView({ behavior: "smooth", block: "start" });
    showNotice("Versão HTML de impressão preparada. A janela de impressão será aberta.", "success");
    buttonFeedback(button, "success", "Preparado");
    window.setTimeout(() => window.print(), 350);
  } catch {
    showNotice("Não foi possível preparar o relatório para impressão.", "error");
    buttonFeedback(button, "error", "Erro");
  }
}

function buildPrintReport() {
  const report = document.getElementById("printReport");
  report.innerHTML = createBusinessPlanDocumentHtml();
}

function createBusinessPlanDocumentHtml() {
  const company = getField("nomeEmpresa") || "Plano de Negócios";
  const location = getField("cidadeUf");
  const year = getField("ano") || new Date().getFullYear();
  const businessLogo = state.images.logo || KORU_LOGO_SRC;
  const primaryColor = sanitizeColor(getField("reportPrimaryColor"), "#171512");
  const accentColor = sanitizeColor(getField("reportAccentColor"), "#b08a4a");
  const printableSections = sections.filter(sectionHasPrintContent);
  const generatedAt = new Date().toLocaleDateString("pt-BR");

  return `
    <style>
      #printReport {
        --print-primary: ${primaryColor};
        --print-accent: ${accentColor};
      }
    </style>
    ${renderDocumentPage(`
      <div class="document-cover-strip"></div>
      <div class="document-cover-top">
        <img class="document-koru-logo" src="${KORU_LOGO_SRC}" alt="KORU Company">
        <span>KORU COMPANY</span>
      </div>
      <img class="document-logo" src="${businessLogo}" alt="Logo da empresa">
      <p class="document-kicker">Plano de Negócios Estratégico</p>
      <h1>${escapeHtml(company)}</h1>
      <p class="document-subtitle">${escapeHtml(getField("slogan") || "Plano de negócios completo, estruturado e pronto para apresentação.")}</p>
      <dl class="document-meta">
        <div><dt>Local</dt><dd>${escapeHtml(location || "Nao informado")}</dd></div>
        <div><dt>Ano</dt><dd>${escapeHtml(year)}</dd></div>
        <div><dt>Gerado em</dt><dd>${generatedAt}</dd></div>
      </dl>
    `, { pageClass: "document-cover", hideChrome: true })}
    ${renderDocumentSummary(printableSections)}
    ${printableSections.map((section, index) => renderDocumentSection(section, index)).join("")}
    ${renderDocumentImagePages()}
    ${renderDocumentClosing(company, generatedAt)}
  `;
}

function renderDocumentPage(content, options = {}) {
  const pageClass = options.pageClass || "";
  const hideChrome = options.hideChrome ? " no-page-chrome" : "";
  const bodyClass = options.bodyClass || "";

  return `
    <section class="document-page ${pageClass}${hideChrome}">
      <div class="document-watermark" aria-hidden="true"><img src="${KORU_LOGO_SRC}" alt=""></div>
      ${options.hideChrome ? "" : `
        <header class="document-header">
          <img src="${KORU_LOGO_SRC}" alt="KORU Company">
          <span>${PDF_TITLE}</span>
        </header>
      `}
      <main class="document-body ${bodyClass}">
        ${content}
      </main>
      ${options.hideChrome ? "" : `
        <footer class="document-footer">
          <span>Koru Company — Plano de Negócios</span>
          <span>Documento gerado pelo PNKC</span>
          <span>${COMPANY_SITE_URL}</span>
        </footer>
      `}
    </section>
  `;
}

function sectionHasPrintContent(section) {
  const fields = (section.fields || []).filter((field) => !field.type && !HIDDEN_PRINT_FIELDS.has(field.name) && isFilled(state.fields[field.name]));
  const tables = (section.tables || []).filter((table) => (state.tables[table.id] || []).some((row) => row.some(isFilled)));
  const hasFinanceValues = section.finance && ["receitaBruta", "custosFixos", "custosVariaveis", "lucroLiquido", "investimentoTotal"].some((field) => isFilled(state.fields[field]));
  return Boolean(fields.length || tables.length || hasFinanceValues);
}

function renderDocumentSummary(printableSections) {
  return renderDocumentPage(`
      <div class="document-summary-head">
        <span>Sumário</span>
        <strong>Koru Company</strong>
      </div>
      <h2>Plano de negócios</h2>
      <ol>
        ${printableSections.map((section, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><strong>${section.title}</strong><em></em></li>`).join("")}
      </ol>
  `, { pageClass: "document-summary" });
}

function renderDocumentSection(section, index) {
  const fields = (section.fields || []).filter((field) => shouldPrintField(section, field));
  const tables = (section.tables || []).filter((table) => (state.tables[table.id] || []).some((row) => row.some(isFilled)));
  const specialContent = renderSpecialPrintContent(section);
  if (!fields.length && !tables.length && !specialContent) return "";

  return renderDocumentPage(`
    <article class="document-section">
      <div class="document-section-title">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h2>${section.title}</h2>
      </div>
      ${fields.map((field) => `<p class="document-field"><strong>${field.label}</strong>${formatDocumentValue(field, state.fields[field.name])}</p>`).join("")}
      ${specialContent}
      ${tables.map(renderDocumentTable).join("")}
    </article>
  `, { pageClass: "document-content-page" });
}

function renderDocumentImagePages() {
  return (state.images.anexos || []).map((image, index) => renderDocumentPage(`
    <div class="document-image-frame">
      <img src="${image}" alt="Anexo ${index + 1}">
    </div>
    <p class="document-image-caption">Anexo ${index + 1}</p>
  `, { pageClass: "document-image-page", bodyClass: "document-image-body" })).join("");
}

function renderDocumentClosing(company, generatedAt) {
  return renderDocumentPage(`
      <img src="${KORU_LOGO_SRC}" alt="KORU Company">
      <p>Obrigado</p>
      <h2>${escapeHtml(company || "Koru Company")}</h2>
      <strong>Entender antes de desenvolver.</strong>
      <div>
        <span>Plano de Negócios — Koru Company</span>
        <span>Documento gerado em ${generatedAt}</span>
      </div>
  `, { pageClass: "document-closing", hideChrome: true });
}

function shouldPrintField(section, field) {
  if (field.type || HIDDEN_PRINT_FIELDS.has(field.name) || !isFilled(state.fields[field.name])) return false;
  if (section.id === "swot" && ["forcas", "fraquezas", "oportunidades", "ameacas"].includes(field.name)) return false;
  return true;
}

function renderSpecialPrintContent(section) {
  if (section.id === "financeiro") return renderDocumentFinancialDashboard();
  if (section.id === "swot") return renderDocumentSwotMatrix();
  if (section.id === "cronograma") return renderDocumentTimelineRoadmap();
  return "";
}

function renderDocumentFinancialDashboard() {
  const receita = Number(state.fields.receitaBruta || 0);
  const fixos = Number(state.fields.custosFixos || 0);
  const variaveis = Number(state.fields.custosVariaveis || 0);
  const lucro = Number(state.fields.lucroLiquido || 0);
  const investimento = Number(state.fields.investimentoTotal || 0);
  const maxValue = Math.max(receita, fixos, variaveis, lucro, investimento, 1);
  const values = [
    ["Receita", receita],
    ["Custos fixos", fixos],
    ["Custos variáveis", variaveis],
    ["Lucro líquido", lucro],
    ["Investimento", investimento]
  ];

  return `
    <div class="document-finance-dashboard">
      ${values.map(([label, value]) => `
        <div class="document-finance-bar">
          <div><strong>${label}</strong><span>${money(value)}</span></div>
          <i style="width:${Math.max(3, Math.round((value / maxValue) * 100))}%"></i>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDocumentSwotMatrix() {
  const items = [
    ["Forças", "forcas"],
    ["Fraquezas", "fraquezas"],
    ["Oportunidades", "oportunidades"],
    ["Ameaças", "ameacas"]
  ].filter(([, field]) => isFilled(state.fields[field]));

  if (!items.length) return "";

  return `
    <div class="document-swot-matrix">
      ${items.map(([label, field]) => `
        <div>
          <strong>${label}</strong>
          <p>${formatDocumentValue({ name: field }, state.fields[field])}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDocumentTimelineRoadmap() {
  const rows = (state.tables.cronogramaTable || []).filter((row) => row.some(isFilled));
  if (!rows.length) return "";

  return `
    <div class="document-roadmap">
      ${rows.map((row) => `
        <div class="document-roadmap-item">
          <span>${escapeHtml(formatDate(row[2]) || "Prazo a definir")}</span>
          <strong>${escapeHtml(row[0] || "Atividade")}</strong>
          <p>${escapeHtml([row[1], row[3], row[4]].filter(Boolean).join(" • "))}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDocumentTable(table) {
  const rows = (state.tables[table.id] || []).filter((row) => row.some(isFilled));
  if (!rows.length) return "";
  return `
    <table class="document-table">
      <caption><strong>${table.title}</strong></caption>
      <thead><tr>${table.columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${table.columns.map((_, index) => `<td>${formatDocumentTableCell(table, index, row[index])}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

function formatDocumentTableCell(table, columnIndex, value) {
  if (!isFilled(value)) return "";
  if (table.dateColumn === columnIndex) return escapeHtml(formatDate(value));
  if (table.numericColumn === columnIndex) return money(value);
  if (/valor|receita|preço|preco/i.test(table.columns[columnIndex])) return money(value);
  return escapeHtml(value);
}

function sanitizeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback;
}

function formatDocumentValue(field, value) {
  if (field.inputType === "date") return escapeHtml(formatDate(value));
  if (MONEY_FIELDS.has(field.name)) return money(value);
  if (field.inputType === "number") return escapeHtml(String(value).replace(".", ","));
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function slug(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

renderApp();
