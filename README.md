# AnalisaXML Tributário: IBS, CBS e ICMS

Leitor local de XML de NF-e (modelo 55) e NFC-e (modelo 65) para conferir, item a item, os valores de ICMS, IBS e CBS informados no arquivo. Roda 100% no navegador: nenhum XML é enviado para servidor.

**Site:** https://silvioalbqrq.github.io/AnaliseXML-IBSeCBS/

## O que a ferramenta faz

- Lê vários arquivos `.xml`, uma pasta inteira ou um `.zip` (inclusive arrastando a pasta para a área de upload).
- Aceita XMLs com mais de uma `<infNFe>` no mesmo arquivo: cada nota é tratada separadamente.
- Ignora duplicidades pela chave de acesso (`Id` da `<infNFe>`), mesmo que o mesmo XML seja carregado duas vezes.
- Mostra, por item:
  - CST/CSOSN e origem do ICMS, ICMS próprio (`vBC`, `pICMS`, `vICMS`);
  - ICMS ST recolhido (`vBCST`, `pICMSST`, `vICMSST`) e retido (`vBCSTRet`, `pICMSSTRet`, `vICMSSTRet`);
  - CST e `cClassTrib` do IBS/CBS;
  - base (`vBC`), alíquotas e valores de IBS UF, IBS Mun e CBS.
- Lê a situação da nota em `protNFe/infProt/cStat`: autorizada, cancelada, denegada ou sem protocolo.
- Soma apenas os itens **visíveis no filtro atual e marcados**. Notas canceladas/denegadas continuam na tabela, mas ficam fora dos totais.
- Exibe `— / não informado` quando a tag não existe no XML. Ausência de tag nunca é convertida em R$ 0,00.
- Confere os totais do XML (`<ICMSTot>` e `<IBSCBSTot>`) contra a soma dos itens e também a aritmética de cada item (base × alíquota), com tolerância de R$ 0,02 para arredondamento.
- Exporta CSV (UTF-8 com BOM, separador `;`) dos itens visíveis e marcados, com neutralização de fórmulas (=, +, -, @).
- Imprime ou salva em PDF com layout próprio.

## O que a ferramenta **não** faz

- Não calcula imposto devido, crédito, partilha ou substituição tributária. Apenas lê e soma o que está no XML.
- Não valida assinatura digital, schema, autenticidade ou autorização na SEFAZ.
- Não lê NFS-e, CT-e, MDF-e ou outros modelos; aceita somente 55 e 65.
- Não detalha os grupos especiais de IBS/CBS (`gIBSCBSMono`, `gTribRegular`, `gCredPres`, `gTransfCred`, `gAjusteCompet`). Quando presentes, o item é sinalizado como “grupo especial não detalhado” — os valores não são inferidos.
- Não aplica as regras de transição de 2026. Os percentuais de IBS (0,1% estadual) e CBS (0,9%) são os informados no XML, não uma regra fixa da ferramenta.
- A conferência de totais é uma ajuda de auditoria, não um parecer fiscal. Diferenças de arredondamento até R$ 0,02 são aceitas.

## Mapeamento das tags

| Campo exibido | Tag lida |
| --- | --- |
| Identificação | `infNFe/ide` (`mod`, `serie`, `nNF`, `dhEmi`), `infNFe/emit` |
| Item | `det/prod` (`cProd`, `xProd`, `NCM`, `CFOP`, `vProd`) |
| CST/CSOSN e origem | `det/imposto/ICMS/*` (`CST`, `CSOSN`, `orig`) |
| ICMS próprio | `vBC`, `pICMS`, `vICMS` |
| ICMS ST recolhido | `vBCST`, `pICMSST`, `vICMSST` |
| ICMS ST retido | `vBCSTRet`, `pICMSSTRet`, `vICMSSTRet` |
| CST/cClassTrib IBS/CBS | `det/imposto/IBSCBS/CST` e `cClassTrib` |
| Base IBS/CBS | `IBSCBS/gIBSCBS/vBC` (sem fallback para `vProd`) |
| IBS UF | `gIBSCBS/gIBSUF/pIBSUF` e `vIBSUF` |
| IBS Mun | `gIBSCBS/gIBSMun/pIBSMun` e `vIBSMun` |
| IBS total do item | `gIBSCBS/vIBS` ou `vIBSUF + vIBSMun` |
| CBS | `gIBSCBS/gCBS/pCBS` e `vCBS` |
| Totais da nota | `total/ICMSTot` (`vProd`, `vICMS`, `vICMSST`/`vST`, `vNF`) e `total/IBSCBSTot` (`vBCIBSCBS`, `vIBS`, `vCBS`) |
| Situação | `protNFe/infProt/cStat` |

## Como usar

1. Abra o site publicado ou o `index.html` do repositório.
2. Arraste um ou mais XMLs, uma pasta ou um `.zip`.
3. Use a busca e o filtro de modelo; os cards e o CSV respeitam o filtro e a seleção.
4. Abra “Conferência dos totais do XML × soma dos itens” para ver divergências.
5. Use “Exportar CSV” ou “Imprimir”.

Para rodar localmente:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000/`.

## Arquivos

- `index.html` — aplicação (HTML, CSS e JavaScript).
- `vendor/jszip.min.js` — JSZip 3.10.1 para leitura de `.zip`, servido localmente.
- `selftest.js` — autoteste com XMLs sintéticos.
- `README.md` — este documento.

## Autoteste

Abra `index.html?selftest=1`. O painel no topo mostra o resultado das verificações: nota autorizada, duplicidade, múltiplas NF-e no mesmo XML, totais divergentes, nota cancelada, ausência de IBS/CBS, ICMS ST recolhido/retido, grupo especial e neutralização de CSV. Os fixtures são sintéticos; nenhum XML real é versionado.

## Privacidade

Todo o processamento ocorre no navegador (`DOMParser` + `FileReader`/Blob). Não há backend, analytics, armazenamento remoto ou envio de chave de acesso. O único recurso externo é o próprio site; o JSZip é local.

## Base normativa

- EC 132/2023
- LC 214/2025
- NT 2025.002 (tabelas de classificação do IBS/CBS), incluindo os códigos CST do IBS/CBS.

Ferramenta educacional. Não substitui parecer técnico ou assessoria contábil.
