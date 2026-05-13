# PlanoPro - Montador de Plano de Negócios

Aplicação web estática para criar, preencher, salvar, exportar e imprimir planos de negócios completos. O projeto foi reorganizado a partir de um protótipo em HTML único e usa referências de roteiros do Sebrae e modelos acadêmicos presentes no repositório.

## Funcionalidades

- Formulário dividido por etapas com navegação lateral.
- Barra de progresso baseada nos campos, tabelas e imagens preenchidos.
- Salvamento automático em `localStorage`.
- Continuação de rascunho ao reabrir o navegador.
- Upload de logo e imagens de anexos.
- Exportação e importação em JSON.
- Relatório profissional para impressão ou salvar em PDF.
- Cálculos financeiros com tratamento de campos vazios e divisão por zero:
  - Ponto de equilíbrio.
  - Lucratividade.
  - Rentabilidade.
  - Prazo de retorno do investimento.
- Validações amigáveis em campos essenciais.
- Layout responsivo para desktop, tablet e celular.
- Acessibilidade básica com labels, foco visível, contraste e navegação por teclado.

## Como executar localmente

O site não exige backend nem etapa de build.

1. Abra `index.html` diretamente no navegador.
2. Opcionalmente, rode um servidor local para testar como site:

```powershell
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Como usar

1. Clique em **Começar agora**.
2. Preencha as etapas do plano de negócios.
3. Use **Salvar** para gravar manualmente ou aguarde o salvamento automático.
4. Use **Exportar** para baixar um backup em JSON.
5. Use **Importar** para restaurar um JSON salvo.
6. Use **Imprimir/PDF** para gerar um relatório com logo, data e seções preenchidas.
7. Use **Limpar dados** apenas quando quiser apagar o rascunho salvo neste navegador.

## Estrutura de pastas

```text
.
├── index.html
├── site-plano-de-negocios.html
├── README.md
├── assets
│   ├── css
│   │   └── styles.css
│   ├── img
│   │   └── hero.jpg
│   ├── js
│   │   └── app.js
│   └── favicon.svg
└── PDFs de referência
```

`site-plano-de-negocios.html` foi mantido como página de compatibilidade e redireciona para `index.html`.

## Publicar no GitHub Pages

1. Envie estes arquivos para um repositório GitHub.
2. Acesse **Settings > Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch principal e a pasta raiz (`/root`).
5. Salve e aguarde a URL publicada.

## Publicar na Netlify

1. Entre em Netlify e escolha **Add new site > Deploy manually**.
2. Arraste a pasta do projeto para a área de deploy.
3. Como é um site estático, não informe comando de build.
4. A pasta de publicação é a raiz do projeto.

## Publicar na Vercel

1. Importe o repositório na Vercel.
2. Framework preset: **Other**.
3. Build command: deixe vazio.
4. Output directory: deixe vazio ou use `.`.
5. Publique.

## Próximas melhorias

- Exportação em `.docx`.
- Geração automática de sumário executivo a partir dos campos preenchidos.
- Máscaras para CNPJ, moeda e telefone.
- Modo colaborativo com backend opcional.
- Armazenamento em nuvem por conta de usuário.
- Gráficos financeiros e projeções por mês.
