/* =========================================

 * GAME OVER

========================================= */



function mostrarTelaMorte() {

    cancelarArena();



    emCombate = false;

    emFaseDesvio = false;



    telaMorte.classList.remove("oculto");



    jogoBox.classList.add("oculto");



    tocarSomDano();

}



function reiniciarJogoCompleto() {

    cancelarArena();

    pararParticulasFogueira();



    nivel = 1;

    almas = 0;

    almasNecessarias = 30;



    vidaMax = 20;

    vida = 20;



    danoAtaque = 5;

    agilidade = 0;



    macasMax = 5;

    macas = 5;



    animaisCapturados = [];



    animalAtual = null;



    emCombate = false;

    emFaseDesvio = false;

    bloqueado = false;
    ataqueEmAndamento = false;



    misericordia = 0;



    skinAtual = "rei";



    $("modal-overlay").classList.add("oculto");

    telaMorte.classList.add("oculto");



    // Ao reiniciar, volta para a tela de título para escolher a alma novamente.
    jogoIniciado = false;
    telaInicio.style.opacity = "1";
    telaInicio.style.transition = "none";
    telaInicio.classList.remove("oculto");
    $("tela-selecao-personagem").classList.add("oculto");
    jogoBox.classList.add("oculto");

    atualizarStatus();

}



/* =========================================

 * INICIALIZAÇÃO

========================================= */



window.addEventListener("DOMContentLoaded", () => {

    atualizarStatus();



    telaMorte.classList.add("oculto");

    jogoBox.classList.add("oculto");



    botoesCombate.style.display = "none";

    menuInterativo.style.display = "none";

    arenaBox.style.display = "none";

});
