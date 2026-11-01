/* =========================================
   DARK APPLES — FLUXO DO JOGO
========================================= */


/* =========================================
   RESTAURAR TURNO
========================================= */

function restaurarTurno() {
    if (!emCombate) return;

    // Libera as ações para o novo turno do jogador.
    ataqueEmAndamento = false;

    ocultarModosDisplay();

    caixaTexto.style.display = "block";
    botoesCombate.style.display = "grid";
    menuInterativo.style.display = "none";

    escreverTexto(
        `* ${animalAtual.nome} observa você.\n* O que você fará?`
    );

    indiceFocado = 0;

    atualizarFocoTeclado(
        "#botoes-principais .ut-btn"
    );
}


/* =========================================
   FINALIZAR COMBATE
========================================= */

function finalizarCombate() {
    cancelarArena();

    emCombate = false;
    emFaseDesvio = false;
    ataqueEmAndamento = false;

    mostrarMonstro(false);
    $("display-principal").classList.remove("modo-arena", "modo-fogueira");

    atualizarHpInimigo();

    animalAtual = null;
    misericordia = 0;

    ocultarModosDisplay();

    caixaTexto.style.display = "block";

    atualizarStatus();
    if (typeof salvarProgressoAtual === "function") salvarProgressoAtual();

    timeoutTexto = setTimeout(() => {
        restaurarMenu();
    }, 1500);
}


/* =========================================
   MENU PRINCIPAL
========================================= */

function restaurarMenu() {
    cancelarArena();

    emCombate = false;
    emFaseDesvio = false;
    ataqueEmAndamento = false;

    animalAtual = null;
    misericordia = 0;

    mostrarMonstro(false);
    $("display-principal").classList.remove("modo-arena", "modo-fogueira");

    atualizarHpInimigo();

    ocultarModosDisplay();

    caixaTexto.style.display = "block";

    alternarBotoesCombate(false);

    escreverTexto(
        "* O caminho continua à sua frente.\n* O que você fará?"
    );

    atualizarStatus();
}