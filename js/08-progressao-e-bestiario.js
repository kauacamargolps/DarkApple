/* =========================================

 * EVOLUÇÃO DE NÍVEL

========================================= */



function evoluirNivel() {
    if (almas < almasNecessarias) {
        // A mensagem fica dentro do próprio menu: não desmonta a fogueira
        // nem deixa controles antigos aparecerem depois de CONTINUAR.
        abrirMenuOpcoesFogueira(`* Almas insuficientes! Você precisa de ${almasNecessarias} e possui ${almas}.`);
        tocarSomBeep(180, 0.16, "sawtooth");
        return;
    }

    almas -= almasNecessarias;
    nivel++;
    almasNecessarias = Math.floor(almasNecessarias * 1.5);
    atualizarStatus();
    vida = vidaMax;
    macas = macasMax;
    atualizarStatus();
    tocarSomLevelUp();
    if (typeof salvarProgressoAtual === "function") salvarProgressoAtual();

    abrirMenuOpcoesFogueira(`✦ NÍVEL AUMENTADO! Você chegou ao LV ${nivel}. Seus atributos aumentaram.`);
}

/* =========================================

 * BESTIÁRIO

========================================= */



function montarListaFeras(titulo, lista, vazio) {
    const contagem = {};
    (lista || []).forEach(nome => contagem[nome] = (contagem[nome] || 0) + 1);
    let html = `<section class="secao-bestiario"><h3>${titulo}</h3>`;
    if (!Object.keys(contagem).length) {
        html += `<p class="bestiario-vazio">${vazio}</p>`;
    } else {
        html += '<div class="grid-bestiario">';
        Object.entries(contagem).forEach(([nome, quantidade]) => {
            const fera = inimigos.find(i => i.nome === nome);
            if (!fera) return;
            html += `<div class="card-bestiario">
                <img src="${fera.imgSrc}" alt="${nome}">
                <span>${nome}</span>
                <span class="card-bestiario-qtd">x${quantidade}</span>
            </div>`;
        });
        html += '</div>';
    }
    return html + '</section>';
}

function mostrarInventario() {
    if (emCombate || bloqueado) return;
    tocarSomAcao();
    pararParticulasFogueira();

    let html = `<h2 class="titulo-bestiario">REGISTRO DAS FERAS</h2>
        <p class="subtitulo-bestiario">Sua jornada: ${animaisCapturados.length} poupadas · ${animaisDerrotados.length} derrotadas</p>`;
    html += montarListaFeras("✦ FERAS POUPADAS", animaisCapturados, "* Você ainda não poupou nenhuma fera.");
    html += montarListaFeras("⚔ FERAS DERROTADAS", animaisDerrotados, "* Você ainda não derrotou nenhuma fera.");
    abrirModal(html);
}
