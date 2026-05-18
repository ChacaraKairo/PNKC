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
      { name: "capitalGiro", label: "Capital de giro necessário", inputType: "number", step: "0.01" },
      { name: "reservaMinima", label: "Reserva mínima", inputType: "number", step: "0.01" },
      { name: "prazoRecebimento", label: "Prazo médio de recebimento (dias)", inputType: "number", step: "1" },
      { name: "prazoPagamento", label: "Prazo médio de pagamento (dias)", inputType: "number", step: "1" },
      { name: "estoqueInicial", label: "Estoque inicial", inputType: "number", step: "0.01" },
      { name: "necessidadeCapitalGiro", label: "Necessidade estimada de capital de giro", inputType: "number", step: "0.01" }
    ],
    finance: true,
    tables: [
      { id: "investimentosTable", title: "Investimentos iniciais", columns: ["Item", "Categoria", "Quantidade", "Valor unitário", "Valor total", "Observação"], numericColumns: [2, 3, 4] },
      { id: "receitasTable", title: "Receitas previstas", columns: ["Produto/serviço", "Quantidade mensal", "Preço médio", "Receita estimada", "Observação"], numericColumns: [1, 2, 3] },
      { id: "custosFixosTable", title: "Custos fixos", columns: ["Item", "Valor mensal", "Categoria", "Observação"], numericColumns: [1] },
      { id: "custosVariaveisTable", title: "Custos variáveis", columns: ["Item", "Valor por venda ou percentual", "Tipo", "Observação"], numericColumns: [1], selectColumn: 2, options: ["Valor fixo", "Percentual"] },
      { id: "capitalGiroTable", title: "Capital de giro", columns: ["Item", "Valor", "Prazo/critério", "Observação"], numericColumns: [1] },
      { id: "projecaoMensalTable", title: "Projeção mensal simples", columns: ["Mês", "Receita", "Custos fixos", "Custos variáveis", "Lucro estimado", "Saldo acumulado"], numericColumns: [1, 2, 3, 4, 5], defaultRows: Array.from({ length: 12 }, (_, index) => [`Mês ${index + 1}`, "", "", "", "", ""]) }
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
  reservaMinima: "Informe uma reserva financeira para cobrir imprevistos e meses de baixa receita. Uma boa referencia inicial e manter caixa para algumas despesas fixas.",
  prazoRecebimento: "Informe em quantos dias, em media, a empresa recebe dos clientes apos vender. Esse prazo ajuda a calcular necessidade de caixa.",
  prazoPagamento: "Informe em quantos dias, em media, a empresa paga fornecedores e despesas. Compare com o prazo de recebimento para evitar falta de caixa.",
  estoqueInicial: "Estime o valor necessario para comprar o primeiro estoque ou insumos antes das vendas comecarem.",
  necessidadeCapitalGiro: "Calcule ou estime quanto dinheiro ficara preso na operacao para cobrir estoque, prazos de recebimento e despesas ate o caixa entrar.",
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
  capitalGiroTable: "Detalhe reservas, prazos, estoque inicial e necessidades de caixa para manter a operacao ate as receitas entrarem.",
  projecaoMensalTable: "Projete 12 meses de receitas, custos, lucro e saldo acumulado para enxergar sazonalidade e necessidade de caixa.",
  cronogramaTable: "Transforme o plano em execucao. Cada linha deve ter uma meta ou atividade clara, responsavel, prazo, status e observacoes sobre dependencia ou proximo passo."
};

const FIELD_MAX_LENGTHS = {
  nomeEmpresa: 90,
  nomeFantasia: 70,
  autor: 80,
  cidadeUf: 60,
  ano: 4,
  slogan: 120,
  razaoSocial: 120,
  cnpj: 25,
  cnae: 120,
  endereco: 180,
  regiao: 120,
  nicho: 180,
  publicoAlvo: 700,
  produtosServicos: 700,
  expectativas: 700,
  indicadoresResumo: 700,
  missao: 500,
  visao: 500,
  valores: 700,
  equipeAtual: 700,
  competenciasCriticas: 700,
  objetoSocial: 700,
  licencas: 600,
  riscosLegais: 700,
  persona: 900,
  tendencias: 900,
  posicionamento: 700,
  diferencial: 800,
  preco: 700,
  canaisVenda: 700,
  promocao: 800,
  localFuncionamento: 700,
  estruturaNecessaria: 700,
  equipamentos: 600,
  softwares: 600,
  equipe5anos: 700,
  capacidade: 600,
  forcas: 700,
  fraquezas: 700,
  oportunidades: 700,
  ameacas: 700,
  fatoresCriticos: 800,
  acoesCurtoPrazo: 900,
  observacoesFinais: 1000,
  resumoNegocio: 1400,
  definicaoNegocio: 1400,
  clientes: 1400,
  problemaMercado: 1200,
  propostaValor: 900,
  jornada: 1000,
  processosInternos: 1000,
  processoOperacional: 1000
};

const TABLE_MAX_CELL_LENGTHS = {
  sociosTable: 180,
  concorrentesTable: 220,
  fornecedoresTable: 180,
  investimentosTable: 120,
  receitasTable: 120,
  custosFixosTable: 120,
  custosVariaveisTable: 120,
  capitalGiroTable: 120,
  projecaoMensalTable: 80,
  cronogramaTable: 160
};

let limitNormalizationReport = [];

function findFieldConfig(fieldName) {
  for (const section of sections) {
    const field = (section.fields || []).find((item) => item.name === fieldName);
    if (field) return field;
  }

  return null;
}

function getFieldMaxLength(field) {
  if (!field || field.type || field.kind === "select") return null;
  if (field.inputType === "number" || field.inputType === "date" || field.inputType === "color") return null;
  if (Number.isFinite(field.maxLength)) return field.maxLength;
  if (field.kind === "textarea") return field.full ? 900 : 600;
  return 120;
}

function getTableCellMaxLength(table, columnIndex) {
  if (!table) return 160;
  if (Array.isArray(table.maxCellLengths) && Number.isFinite(table.maxCellLengths[columnIndex])) {
    return table.maxCellLengths[columnIndex];
  }
  if (Number.isFinite(table.maxCellLength)) return table.maxCellLength;
  return 160;
}

function normalizeFieldValueByLimit(fieldName, value) {
  const field = findFieldConfig(fieldName);
  const maxLength = getFieldMaxLength(field);
  if (!maxLength) return value;

  const text = String(value || "");
  if (text.length <= maxLength) return text;

  limitNormalizationReport.push({ type: "field", name: fieldName, maxLength, originalLength: text.length });
  console.warn(`[PNKC] Campo ${fieldName} foi cortado para ${maxLength} caracteres.`);
  return text.slice(0, maxLength).trim();
}

function normalizeTableCellValueByLimit(table, columnIndex, value) {
  const numericColumns = new Set([table?.numericColumn, ...(table?.numericColumns || [])].filter((column) => column !== undefined));
  if (!table || table.dateColumn === columnIndex || table.selectColumn === columnIndex || numericColumns.has(columnIndex)) return value;

  const maxLength = getTableCellMaxLength(table, columnIndex);
  const text = String(value || "");
  if (!maxLength || text.length <= maxLength) return text;

  limitNormalizationReport.push({ type: "table", name: table.id, columnIndex, maxLength, originalLength: text.length });
  console.warn(`[PNKC] Celula da tabela ${table.id} foi cortada para ${maxLength} caracteres.`);
  return text.slice(0, maxLength).trim();
}

function enrichGuidance() {
  sections.forEach((section) => {
    (section.fields || []).forEach((field) => {
      if (detailedFieldHelp[field.name]) field.help = detailedFieldHelp[field.name];
      if (FIELD_MAX_LENGTHS[field.name]) field.maxLength = FIELD_MAX_LENGTHS[field.name];
    });

    (section.tables || []).forEach((table) => {
      if (detailedTableHelp[table.id]) table.help = detailedTableHelp[table.id];
      if (TABLE_MAX_CELL_LENGTHS[table.id]) table.maxCellLength = TABLE_MAX_CELL_LENGTHS[table.id];
    });
  });
}
