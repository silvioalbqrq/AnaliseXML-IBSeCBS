/* Autoteste do AnalisaXML — fixtures sintéticos, nenhum dado real.
   Abra index.html?selftest=1 para executar. */
(function () {
    const A = window.AnalisaXML;
    const NS = 'http://www.portalfiscal.inf.br/nfe';
    const results = [];

    function check(cond, name, detail) {
        results.push({ ok: !!cond, name, detail: detail || '' });
    }
    function tag(n, v) { return (v === null || v === undefined || v === '') ? '' : '<' + n + '>' + v + '</' + n + '>'; }

    function itemXml(o) {
        return '<det nItem="' + o.nItem + '"><prod>' +
            tag('cProd', o.code || o.nItem) + tag('xProd', o.desc || 'PRODUTO TESTE') +
            tag('NCM', o.ncm || '00000000') + tag('CFOP', o.cfop || '5102') + tag('vProd', o.vProd) +
            '</prod><imposto>' + (o.icms || '') + (o.ibs || '') + '</imposto></det>';
    }

    function noteXml(o) {
        const ide = '<ide><cUF>23</cUF><mod>' + (o.mod || '55') + '</mod><serie>' + (o.serie || '1') +
            '</serie><nNF>' + (o.nNF || '1') + '</nNF><dhEmi>' + (o.dhEmi || '2026-09-01T10:00:00-03:00') + '</dhEmi></ide>';
        const emit = '<emit>' + tag('CNPJ', o.cnpj || '11111111000111') + tag('xNome', o.emit || 'EMITENTE TESTE') + '</emit>';
        const dets = (o.items || []).map(function (it, i) { it.nItem = i + 1; return itemXml(it); }).join('');
        const ibsTot = o.ibsTot
            ? '<IBSCBSTot>' + tag('vBCIBSCBS', o.ibsTot.vBC) + '<gIBS>' + tag('vIBS', o.ibsTot.vIBS) + '</gIBS><gCBS>' + tag('vCBS', o.ibsTot.vCBS) + '</gCBS></IBSCBSTot>'
            : '';
        const icmsTot = '<ICMSTot>' + tag('vProd', o.totProd) + tag('vICMS', o.totIcms) + tag('vICMSST', o.totIcmsSt) + tag('vNF', o.totNf) + '</ICMSTot>';
        const inf = '<infNFe Id="NFe' + o.chave + '" versao="4.00">' + ide + emit + dets + '<total>' + icmsTot + ibsTot + '</total></infNFe>';
        return '<NFe>' + inf + '</NFe>';
    }

    function proc(o) {
        const prot = o.prot
            ? '<protNFe versao="4.00"><infProt><chNFe>' + o.chave + '</chNFe><cStat>' + o.prot + '</cStat><xMotivo>teste</xMotivo></infProt></protNFe>'
            : '';
        return '<?xml version="1.0" encoding="UTF-8"?><nfeProc xmlns="' + NS + '" versao="4.00">' + noteXml(o) + prot + '</nfeProc>';
    }

    function lote(notes) {
        return '<?xml version="1.0" encoding="UTF-8"?><enviNFe xmlns="' + NS + '" versao="4.00">' +
            notes.map(noteXml).join('') + '</enviNFe>';
    }

    const ICMS00 = function (bc, aliqq, v) {
        return '<ICMS><ICMS00><orig>0</orig><CST>00</CST><vBC>' + bc + '</vBC><pICMS>' + aliqq + '</pICMS><vICMS>' + v + '</vICMS></ICMS00></ICMS>';
    };
    const ICMS10 = function (bc, aliqq, v, bcst, aliqqst, vst) {
        return '<ICMS><ICMS10><orig>0</orig><CST>10</CST><vBC>' + bc + '</vBC><pICMS>' + aliqq + '</pICMS><vICMS>' + v + '</vICMS>' +
            '<vBCST>' + bcst + '</vBCST><pICMSST>' + aliqqst + '</pICMSST><vICMSST>' + vst + '</vICMSST></ICMS10></ICMS>';
    };
    const ICMS60 = function (bcst, aliqq, vst) {
        return '<ICMS><ICMS60><orig>0</orig><CST>60</CST><vBCSTRet>' + bcst + '</vBCSTRet><pICMSSTRet>' + aliqq + '</pICMSSTRet>' +
            '<vICMSSTRet>' + vst + '</vICMSSTRet><vICMS>0.00</vICMS></ICMS60></ICMS>';
    };
    const IBS = function (bc, puf, vuf, pmun, vmun, pcbs, vcbs) {
        return '<IBSCBS><CST>000</CST><cClassTrib>000001</cClassTrib><gIBSCBS><vBC>' + bc + '</vBC>' +
            '<gIBSUF><pIBSUF>' + puf + '</pIBSUF><vIBSUF>' + vuf + '</vIBSUF></gIBSUF>' +
            '<gIBSMun><pIBSMun>' + pmun + '</pIBSMun><vIBSMun>' + vmun + '</vIBSMun></gIBSMun>' +
            '<gCBS><pCBS>' + pcbs + '</pCBS><vCBS>' + vcbs + '</vCBS></gCBS></gIBSCBS></IBSCBS>';
    };

    function run(name, fn) {
        A.reset();
        try { fn(); }
        catch (err) { check(false, name + ' (exceção)', err && err.message ? err.message : String(err)); }
    }

    // 1. Nota autorizada com IBS/CBS, 2 itens, totais coerentes.
    run('nota autorizada com IBS/CBS', function () {
        A.parseXMLText(proc({
            chave: 'TESTE0001', nNF: '1001', prot: '100',
            items: [
                { vProd: '100.00', icms: ICMS00('100.00', '18.00', '18.00'), ibs: IBS('100.00', '0.1000', '0.10', '0.0000', '0.00', '0.9000', '0.90') },
                { vProd: '50.00', icms: ICMS00('50.00', '18.00', '9.00'), ibs: IBS('50.00', '0.1000', '0.05', '0.0000', '0.00', '0.9000', '0.45') }
            ],
            totProd: '150.00', totIcms: '27.00', totNf: '150.00',
            ibsTot: { vBC: '150.00', vIBS: '0.15', vCBS: '1.35' }
        }), 'teste1.xml');
        const items = A.items();
        check(A.files().length === 1 && items.length === 2, 'nota autorizada: 1 nota e 2 itens');
        check(items[0].status.label === 'Autorizada' && items[0].countable, 'nota autorizada: situação Autorizada');
        check(items[0].vIBSUF === 0.1 && items[1].vCBS === 0.45, 'nota autorizada: valores de IBS UF e CBS');
        const t = A.totals();
        const near = function (a, b) { return Math.abs(a - b) < 0.001; };
        check(t.vProd.sum === 150 && t.vICMS.sum === 27 && near(t.vIBS.sum, 0.15) && near(t.vCBS.sum, 1.35), 'nota autorizada: totais dos itens', 'IBS=' + t.vIBS.sum + ' CBS=' + t.vCBS.sum);
        const bad = A.audit()[0].checks.filter(function (c) { return c.status === 'bad'; });
        check(bad.length === 0, 'nota autorizada: conferência sem divergência');
    });

    // 2. Duplicidade pela chave.
    run('duplicidade pela chave', function () {
        const xml = proc({
            chave: 'TESTE0002', nNF: '1002', prot: '100',
            items: [{ vProd: '10.00', icms: ICMS00('10.00', '18.00', '1.80') }],
            totProd: '10.00', totIcms: '1.80', totNf: '10.00'
        });
        A.parseXMLText(xml, 'a.xml');
        A.parseXMLText(xml, 'b.xml');
        check(A.files().length === 1 && A.items().length === 1, 'duplicidade: segunda carga ignorada');
        check(A.errors().some(function (e) { return /duplicada/i.test(e); }), 'duplicidade: aviso registrado');
    });

    // 3. Várias NFe no mesmo XML, itens vinculados à nota correta.
    run('multi-NFe no mesmo XML', function () {
        A.parseXMLText(lote([
            {
                chave: 'TESTE0003', nNF: '2001',
                items: [{ vProd: '10.00', icms: ICMS00('10.00', '18.00', '1.80') }, { vProd: '20.00', icms: ICMS00('20.00', '18.00', '3.60') }],
                totProd: '30.00', totIcms: '5.40', totNf: '30.00'
            },
            {
                chave: 'TESTE0004', nNF: '2002',
                items: [{ vProd: '30.00', icms: ICMS00('30.00', '18.00', '5.40') }],
                totProd: '30.00', totIcms: '5.40', totNf: '30.00'
            }
        ]), 'lote.xml');
        check(A.files().length === 2 && A.items().length === 3, 'multi-NFe: 2 notas e 3 itens');
        check(A.items().filter(function (i) { return i.nNF === '2001'; }).length === 2, 'multi-NFe: 2 itens na NF 2001');
        check(A.items().filter(function (i) { return i.nNF === '2002'; }).length === 1, 'multi-NFe: 1 item na NF 2002');
    });

    // 4. Totais divergentes do XML.
    run('totais divergentes', function () {
        A.parseXMLText(proc({
            chave: 'TESTE0005', nNF: '1005', prot: '100',
            items: [{ vProd: '100.00', icms: ICMS00('100.00', '18.00', '18.00'), ibs: IBS('100.00', '0.1000', '0.10', '0.0000', '0.00', '0.9000', '0.90') }],
            totProd: '120.00', totIcms: '18.00', totNf: '120.00',
            ibsTot: { vBC: '100.00', vIBS: '0.10', vCBS: '5.00' }
        }), 'divergente.xml');
        const checks = A.audit()[0].checks;
        const bad = checks.filter(function (c) { return c.status === 'bad'; }).map(function (c) { return c.label; });
        check(bad.indexOf('vProd') >= 0, 'divergente: vProd detectado');
        check(bad.indexOf('vCBS') >= 0, 'divergente: vCBS detectado');
    });

    // 5. Nota cancelada fora dos totais.
    run('nota cancelada', function () {
        A.parseXMLText(proc({
            chave: 'TESTE0006', nNF: '1006', prot: '101',
            items: [{ vProd: '99.00', icms: ICMS00('99.00', '18.00', '17.82') }],
            totProd: '99.00', totIcms: '17.82', totNf: '99.00'
        }), 'cancelada.xml');
        const t = A.totals();
        check(A.items()[0].countable === false && A.items()[0].status.label === 'Cancelada', 'cancelada: situação e exclusão marcadas');
        check(t.selected === 0 && t.excluded === 1 && t.vProd.sum === 0, 'cancelada: fora dos totais');
    });

    // 6. Nota sem grupo IBS/CBS: campos nulos, não zero.
    run('sem IBS/CBS', function () {
        A.parseXMLText(proc({
            chave: 'TESTE0007', nNF: '1007', prot: '100',
            items: [{ vProd: '100.00', icms: ICMS00('100.00', '18.00', '18.00') }],
            totProd: '100.00', totIcms: '18.00', totNf: '100.00'
        }), 'sem-ibs.xml');
        const it = A.items()[0];
        check(it.vBC === null && it.vCBS === null && it.vIBSTotal === null, 'sem IBS/CBS: campos nulos');
        const t = A.totals();
        check(t.vCBS.found === 0 && t.vIBS.found === 0, 'sem IBS/CBS: totais não viram R$ 0,00');
        const bad = A.audit()[0].checks.filter(function (c) { return c.status === 'bad'; });
        check(bad.length === 0, 'sem IBS/CBS: ausência não é divergência');
    });

    // 7. ICMS ST recolhido e retido.
    run('ICMS ST recolhido e retido', function () {
        A.parseXMLText(proc({
            chave: 'TESTE0008', nNF: '1008', prot: '100',
            items: [
                { vProd: '100.00', icms: ICMS10('100.00', '18.00', '18.00', '200.00', '18.00', '36.00') },
                { vProd: '50.00', icms: ICMS60('50.00', '18.00', '9.00') }
            ],
            totProd: '150.00', totIcms: '18.00', totIcmsSt: '36.00', totNf: '150.00'
        }), 'st.xml');
        const items = A.items();
        check(items[0].icmsSTBC === 200 && items[0].icmsST === 36 && items[0].icmsSTKind === 'recolhido', 'ICMS ST: recolhido lido');
        check(items[1].icmsSTBC === 50 && items[1].icmsST === 9 && items[1].icmsSTKind === 'retido', 'ICMS ST: retido lido');
        check(A.totals().vICMSST.sum === 45, 'ICMS ST: total soma recolhido + retido');
        const bad = A.audit()[0].checks.filter(function (c) { return c.status === 'bad'; });
        check(bad.length === 0, 'ICMS ST: conferência usa só o ST recolhido');
    });

    // 8. Grupo especial do IBS/CBS sinalizado, sem adivinhar valores.
    run('grupo especial IBS/CBS', function () {
        const ibsMono = '<IBSCBS><CST>620</CST><cClassTrib>620001</cClassTrib><gIBSCBSMono><vBCMono>100.00</vBCMono><pIBSCBSMono>1.00</pIBSCBSMono></gIBSCBSMono></IBSCBS>';
        A.parseXMLText(proc({
            chave: 'TESTE0009', nNF: '1009', prot: '100',
            items: [{ vProd: '100.00', icms: ICMS00('100.00', '18.00', '18.00'), ibs: ibsMono }],
            totProd: '100.00', totIcms: '18.00', totNf: '100.00'
        }), 'mono.xml');
        check(A.items()[0].ibsSpecial.indexOf('gIBSCBSMono') >= 0, 'grupo especial: gIBSCBSMono sinalizado');
        check(A.items()[0].vCBS === null && A.items()[0].vIBSTotal === null, 'grupo especial: valores não são inventados');
    });

    // 9. CSV: neutralização de fórmula.
    run('CSV seguro', function () {
        check(A.csvText('=1+1').indexOf('"\'=') === 0, 'CSV: fórmula = neutralizada');
        check(A.csvText('+55').indexOf('"\'+') === 0, 'CSV: fórmula + neutralizada');
        check(A.csvText('@cmd').indexOf('"\'@') === 0, 'CSV: fórmula @ neutralizada');
        check(A.csvText('texto normal').indexOf('"texto') === 0, 'CSV: texto normal preservado');
    });

    A.reset();
    if (typeof A.renderAll === 'function') A.renderAll();

    const passed = results.filter(function (r) { return r.ok; }).length;
    const panel = document.getElementById('selftestPanel');
    if (panel) {
        panel.className = passed === results.length ? 'ok' : 'bad';
        panel.innerHTML = '<strong>Autoteste: ' + passed + '/' + results.length + ' verificações OK</strong>' +
            '<ul>' + results.map(function (r) {
                return '<li>' + (r.ok ? '✓' : '✗') + ' ' + r.name + (!r.ok && r.detail ? ' — ' + r.detail : '') + '</li>';
            }).join('') + '</ul>';
    }
    if (window.console && console.log) {
        console.log('[Autoteste AnalisaXML] ' + passed + '/' + results.length + ' OK');
        results.filter(function (r) { return !r.ok; }).forEach(function (r) { console.error('FALHOU:', r.name, r.detail); });
    }
})();
