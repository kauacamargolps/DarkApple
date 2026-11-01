/* =========================================
 * ESCOLHA DE PERSONAGEM ANTES DO JOGO
========================================= */

function mostrarSelecaoPersonagem() {
    tocarSomAcao();
    telaInicio.classList.add("oculto");

    const telaSelecao = $("tela-selecao-personagem");
    const grade = $("personagens-iniciais");
    const botaoConfirmar = $("btn-confirmar-personagem");

    grade.innerHTML = "";
    botaoConfirmar.disabled = true;
    indiceFocado = 0;

    Object.entries(skinsDisponiveis).forEach(([chave, skin]) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "card-skin";
        card.innerHTML = `
            <img src="${skin.imgSrc}" alt="${skin.nome}">
            <span>${skin.nome}</span>
            <span class="card-skin-desc">${skin.descricao}</span>
            <span class="marca-selecao">SELECIONAR</span>
        `;

        card.addEventListener("click", () => {
            skinAtual = chave;
            grade.querySelectorAll(".card-skin").forEach(item => {
                item.classList.remove("skin-equipada");
                const marca = item.querySelector(".marca-selecao");
                if (marca) marca.textContent = "SELECIONAR";
            });
            card.classList.add("skin-equipada");
            indiceFocado = Array.from(grade.querySelectorAll(".card-skin")).indexOf(card);
            card.querySelector(".marca-selecao").textContent = "SELECIONADO";
            botaoConfirmar.disabled = false;
            tocarSomAcao();
        });

        grade.appendChild(card);
    });

    telaSelecao.classList.remove("oculto");
    // O primeiro personagem recebe o foco inicial para navegação por teclado.
    botoesAtivos = Array.from(grade.querySelectorAll(".card-skin"));
    if (botoesAtivos.length) botoesAtivos[0].classList.add("focado");
}

function voltarTelaInicio() {
    $("tela-selecao-personagem").classList.add("oculto");
    telaInicio.classList.remove("oculto");
}

function confirmarPersonagemEIniciar() {
    if (!skinsDisponiveis[skinAtual] || jogoIniciado) return;

    $("tela-selecao-personagem").classList.add("oculto");
    if (typeof concluirNovoSaveComPersonagem === "function") concluirNovoSaveComPersonagem();
    iniciarJogo();
}


/* =========================================

 * SELEÇÃO DE SKINS

========================================= */



function abrirSelecaoSkins() {

    if (emCombate || bloqueado) return;



    tocarSomAcao();



    pararParticulasFogueira();



    let html = "<h3>ESCOLHA SUA ALMA</h3>";

    html += '<div class="grid-skins">';



    Object.entries(skinsDisponiveis).forEach(([chave, skin]) => {

        const equipada = chave === skinAtual;



        html += `

            <div class="card-skin ${equipada ? "skin-equipada" : ""}"

                onclick="equiparSkin('${chave}')">



                <img src="${skin.imgSrc}" alt="${skin.nome}">



                <span>${skin.nome}</span>

                <span class="card-skin-desc">${skin.descricao}</span>



                ${equipada ? "<span>EQUIPADA</span>" : ""}

            </div>

        `;

    });



    html += "</div>";



    abrirModal(html);

}



/* =========================================

 * MODAL

========================================= */



function abrirModal(html) {

    $("modal-texto").innerHTML = html;

    $("modal-overlay").classList.remove("oculto");

}



function fecharModal() {

    $("modal-overlay").classList.add("oculto");



    indiceFocado = 0;



    if (emCombate) {

        atualizarFocoTeclado("#botoes-principais .ut-btn");

    } else {

        atualizarFocoTeclado("#menu-navegacao .sub-btn");

    }

}
