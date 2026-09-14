# AnalisaXML Tributário v2 (Versão Completa & Auditoria)

> **Plataforma de Extração, Validação e Auditoria da Reforma Tributária (EC 132/2023)**  
> *Leitor de XML de Nota Fiscal Eletrônica (NF-e) voltado para contadores, auditores fiscais e analistas tributários.*

---

## 📌 Visão Geral

O **AnalisaXML Tributário** (`site_extrator_xml_limpo.html`) é uma solução web *Client-Side* desenvolvida para realizar a leitura, apuração e auditoria de arquivos XML de Nota Fiscal Eletrônica (NF-e) sob a perspectiva da **Reforma Tributária brasileira (Emenda Constitucional nº 132/2023)**.

A ferramenta segrega e calcula detalhadamente os novos impostos incidentes:
- **IBS (Imposto sobre Bens e Serviços):** Dividido entre alíquotas e valores Estaduais (UF) e Municipais (Mun).
- **CBS (Contribuição sobre Bens e Serviços):** Alíquota e valor Federal.
- **Base de Cálculo (`<vBC>`):** Extraída diretamente da nova tag `<gIBSCBS>` ou apurada via *fallback*.

---

## 🚀 Funcionalidades Principais

### 1. 🔍 Validação dos Totais (`<ICMSTot>`) - Auditoria Fiscal
- Compara automaticamente o somatório real dos itens (`<det><vProd>`) com o valor consolidado declarado na tag de cabeçalho do XML (`<ICMSTot><vProd>`).
- Exibe um **card de validação** com alerta dinâmico:
  - **✅ CONSISTENTE:** Quando os valores apurados e declarados batem integralmente.
  - **⚠️ DIVERGENTE:** Quando há divergência de centavos ou inconsistências na emissão da nota.

### 2. 🖨️ Módulo de Impressão e Exportação para PDF
- Botão nativo **"🖨️ Imprimir / Salvar PDF"**.
- Estilo impresso dedicado (`@media print`) que remove elementos de interface (botões de controle, formulário de upload, barra de busca e checkboxes), gerando um relatório limpo e profissional para compor pareceres e auditorias.

### 3. 🔍 Filtro e Busca em Tempo Real
- Campo de busca reativo na barra de ferramentas.
- Permite pesquisar instantaneamente por qualquer termo em **Descrição do Produto**, **Código**, **NCM**, **CST** ou **Classificação Tributária (`cClassTrib`)**, essencial para NF-es com centenas de produtos.

### 4. ⇅ Ordenação Dinâmica por Colunas
- Colunas da tabela clicáveis (`sortable`).
- Permite ordenar em ordem crescente ou decrescente por:
  - `#` (Número do item)
  - `Código / Descrição`
  - `NCM`
  - `CST / ClassTrib`
  - `Valor do Produto`
  - `Base de Cálculo (<vBC>)`
  - `Valor IBS Total`
  - `Valor CBS`

### 5. 📊 Comparação Simultânea de Múltiplos XMLs
- Suporte a seleção e upload em lote de múltiplos arquivos XML simultaneamente.
- Botão **"📊 Comparar XMLs"** que abre uma janela modal exibindo um resumo comparativo de cada nota fiscal (Quantidade de itens, Total dos Produtos, Total IBS e Total CBS).

### 6. 📥 Exportação para CSV / Excel
- Exporta os itens selecionados para um arquivo CSV codificado em UTF-8 com BOM, garantindo compatibilidade direta e sem erros de acentuação no Microsoft Excel.

---

## 📑 Mapeamento das Tags XML

| Campo na Tabela / Auditoria | Tag XML de Origem | Regra de Apuração / Fallback |
| :--- | :--- | :--- |
| **Validação de Totais** | `<ICMSTot> -> <vProd>` vs. `Σ(<det> -> <vProd>)` | Compara a soma dos itens com a tag global da nota fiscal |
| **Código / Descrição** | `<prod> -> <cProd> / <xProd>` | Identificação do produto (Suporta busca reativa) |
| **NCM** | `<prod> -> <NCM>` | Código de Nomenclatura Comum do Mercosul |
| **CST / ClassTrib** | `<IBSCBS> -> <CST> / <cClassTrib>` | Classificação fiscal da Reforma Tributária |
| **Valor Produto** | `<prod> -> <vProd>` | Valor nominal dos bens ou serviços |
| **BC IBS/CBS (`<vBC>`)** | `<gIBSCBS> -> <vBC>` | Extraída da tag específica da EC 132/2023 (ou `vProd` em fallback) |
| **IBS UF (Estadual)** | `<gIBSUF> -> <pIBSUF> / <vIBSUF>` | Alíquota e valor do IBS Estadual (Fallback: 0.10%) |
| **IBS Mun (Municipal)** | `<gIBSMun> -> <pIBSMun> / <vIBSMun>` | Alíquota e valor do IBS Municipal (Fallback: 0.00%) |
| **CBS (Federal)** | `<gCBS> -> <pCBS> / <vCBS>` | Alíquota e valor da CBS Federal (Fallback: 0.90%) |

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica e acessível.
- **CSS3:** Variáveis CSS (`custom properties`), CSS Grid, Flexbox e `@media print` para PDF.
- **JavaScript (ES6+ Vanilla):** Parsing XML via `DOMParser`, manipulação do DOM, ordenação em memória e filtragem dinâmica.
- **Zero Dependências:** Funciona 100% de forma autônoma sem necessidade de frameworks ou servidor (Node.js/PHP).

---

## 🔒 Privacidade & Segurança

Todo o processamento dos arquivos XML ocorre **100% no navegador do usuário** via JavaScript local (`FileReader` / `DOMParser`). Nenhum dado fiscal, chave de acesso ou valor é enviado para servidores externos ou armazenado na nuvem.

---

## 📖 Como Executar

1. Baixe o arquivo `site_extrator_xml_limpo.html`.
2. Abra-o dando um duplo clique ou arrastando para qualquer navegador web moderno (*Google Chrome, Microsoft Edge, Mozilla Firefox, Safari ou Brave*).
3. Arraste um ou mais arquivos XML para a caixa de upload.
4. Utilize a barra de busca, os filtros ou a ordenação de colunas conforme sua necessidade de auditoria.
5. Clique em **"🖨️ Imprimir / Salvar PDF"** para gerar o relatório impresso ou **"📥 Exportar CSV"** para gerar a planilha.
