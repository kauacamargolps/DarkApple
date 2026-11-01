/* =========================================
   DARK APPLES — EXPLORAÇÃO
========================================= */


/* =========================================
   EXPLORAR
========================================= */

function explorar() {
    if (bloqueado || emCombate) return;

    tocarSomAcao();

    pararParticulasFogueira();
    const displayPrincipal = $("display-principal");
    displayPrincipal.classList.remove("modo-fogueira", "modo-arena");

    const sorteio = Math.floor(
        Math.random() * inimigos.length
    );

    // A fera mantém sua identidade, mas ganha atributos extras conforme o LV do jogador.
    // Assim, voltar a enfrentar uma espécie conhecida continua sendo um desafio.
    const feraBase = inimigos[sorteio];
    const escalaFera = 1 + Math.min(1.25, Math.max(0, nivel - 1) * 0.10);
    const hpEscalado = Math.round(feraBase.hpMax * escalaFera);

    animalAtual = {
        ...feraBase,
        hpMax: hpEscalado,
        hp: hpEscalado,
        dano: Math.max(1, Math.round(feraBase.dano * (1 + Math.min(0.9, Math.max(0, nivel - 1) * 0.08)))),
        velocidade: feraBase.velocidade * (1 + Math.min(0.45, Math.max(0, nivel - 1) * 0.035)),
        quantidade: feraBase.quantidade + Math.floor(Math.max(0, nivel - 1) / 3),
        tempoLuta: feraBase.tempoLuta + Math.min(3, Math.max(0, nivel - 1) * 0.25),
        nivelEncontro: nivel,
        misericordia: 0
    };

    misericordia = 0;

    emCombate = true;
    emFaseDesvio = false;
    ataqueEmAndamento = false;

    mostrarMonstro(true, animalAtual.fala);

    atualizarHpInimigo();

    alternarBotoesCombate(true);

    ocultarModosDisplay();

    caixaTexto.style.display = "block";

    escreverTexto(
        `* ${animalAtual.nome} apareceu!\n* Ameaça ajustada ao seu LV ${nivel}.\n* O que você fará?`
    );
}


/* =========================================
   MENU DE AÇÕES
========================================= */

function descricaoDaOpcao(nome) {
    const descricoes = {
        "PACIFICAÇÃO": "Demonstra calma e tenta reduzir a hostilidade da fera.",
        "INTIMIDAÇÃO": "Mostra firmeza e aumenta a piedade em 15%.",
        "ACARICIAR": "Tenta conquistar a confiança da fera com carinho.",
        "ACALMAR": "Tenta tranquilizar a fera e diminuir sua agressividade.",
        "CHECAR": "Analisa a fera, seus pontos de vida e sua descrição. Não inicia um ataque.",
        "VOLTAR": "Fecha as opções e retorna ao menu de combate.",
        "ATACAR": "Realiza um golpe contra a fera.",
        "MAÇÃ": "Consome uma maçã para recuperar vida."
    };
    const chave = nome.replace(/\s*\(.*\)$/, "");
    return descricoes[chave] || descricoes[nome] || "Selecione esta opção para realizar a ação.";
}

// O painel de descrição acompanha a opção que recebe foco ou mouse.
function atualizarDescricaoOpcao(nome) {
    const painel = menuInterativo.querySelector(".descricao-opcao");
    if (!painel) return;
    painel.innerHTML = `<strong>${nome}</strong><span>${descricaoDaOpcao(nome)}</span>`;
}

function abrirMenuOpcoes(opcoes) {
    if (!emCombate || bloqueado || emFaseDesvio) return;

    ocultarModosDisplay();
    botoesCombate.style.display = "none";
    menuInterativo.style.display = "grid";
    menuInterativo.innerHTML = "";

    const painel = document.createElement("div");
    painel.className = "descricao-opcao";
    painel.setAttribute("aria-live", "polite");

    opcoes.forEach(opcao => {
        const botao = document.createElement("button");
        botao.className = "opcao-ut";
        botao.textContent = opcao.nome;
        botao.addEventListener("mouseenter", () => atualizarDescricaoOpcao(opcao.nome));
        botao.addEventListener("focus", () => atualizarDescricaoOpcao(opcao.nome));
        botao.onclick = () => { if (opcao.acao) opcao.acao(); };
        menuInterativo.appendChild(botao);
    });

    menuInterativo.appendChild(painel);
    atualizarDescricaoOpcao(opcoes[0]?.nome || "Ação");
    indiceFocado = 0;
    atualizarFocoTeclado(".opcao-ut");
}