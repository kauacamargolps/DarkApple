/* =========================================
   DARK APPLES — INTERFACE
========================================= */


/* =========================================
   TEXTO COM EFEITO DE DIGITAÇÃO
========================================= */

function escreverTexto(texto, callback = null) {
    clearInterval(intervaloTexto);
    clearTimeout(timeoutTexto);

    narrativaTexto.textContent = "";

    let indice = 0;

    intervaloTexto = setInterval(() => {
        if (indice < texto.length) {
            const caractere = texto[indice];
            narrativaTexto.textContent += caractere;

            if (caractere !== " " && caractere !== "\n") {
                tocarSomBeep(320 + Math.random() * 80, 0.025);
            }

            indice++;
        } else {
            clearInterval(intervaloTexto);
            intervaloTexto = null;

            if (callback) callback();
        }
    }, 22);
}


/* =========================================
   FOCO DOS MENUS
========================================= */

function atualizarFocoTeclado(selector) {
    document.querySelectorAll(".focado").forEach(el => {
        el.classList.remove("focado");
    });

    botoesAtivos = Array.from(
        document.querySelectorAll(selector)
    ).filter(el => el.offsetWidth > 0 && el.offsetHeight > 0);

    if (indiceFocado >= botoesAtivos.length) {
        indiceFocado = 0;
    }

    if (indiceFocado < 0) {
        indiceFocado = botoesAtivos.length - 1;
    }

    if (botoesAtivos.length > 0) {
        botoesAtivos[indiceFocado].classList.add("focado");
        if (botoesAtivos[indiceFocado].classList.contains("opcao-ut")) {
            atualizarDescricaoOpcao(botoesAtivos[indiceFocado].textContent.trim());
        }
    }
}


function manterFoco(direcao = 1) {
    if (botoesAtivos.length === 0) return;

    indiceFocado =
        (indiceFocado + direcao + botoesAtivos.length) % botoesAtivos.length;

    document.querySelectorAll(".focado").forEach(el => {
        el.classList.remove("focado");
    });

    botoesAtivos[indiceFocado].classList.add("focado");
    // Atualiza descrições mesmo quando o foco muda pelas setas, sem mouse.
    if (botoesAtivos[indiceFocado].classList.contains("opcao-ut")) {
        atualizarDescricaoOpcao(botoesAtivos[indiceFocado].textContent.trim());
    }
}


/* =========================================
   INÍCIO DO JOGO
========================================= */

function iniciarJogo() {
    if (jogoIniciado) return;

    // Recalcula os atributos depois que o personagem já foi escolhido.
    vida = 20 + ((nivel - 1) * 3) + obterBonusSkin().hp;
    macas = 5 + obterBonusSkin().macas;
    atualizarStatus();

    // A vida atual começa cheia, respeitando o bônus da skin.
    vida = vidaMax;
    macas = macasMax;
    atualizarStatus();

    jogoIniciado = true;
    if (typeof salvarProgressoAtual === "function") salvarProgressoAtual();

    tocarSomAcao();

    telaInicio.style.opacity = "0";
    telaInicio.style.transition = "opacity .5s";

    setTimeout(() => {
        telaInicio.classList.add("oculto");
        jogoBox.classList.remove("oculto");

        escreverTexto(
            "* Uma nova jornada começa...\n* Sua determinação ainda está viva.",
            () => {
                restaurarMenu();
            }
        );
    }, 500);
}


/* =========================================
   STATUS DO JOGADOR
========================================= */

function atualizarStatus() {
    const bonus = obterBonusSkin();

    const hpBase = 20 + ((nivel - 1) * 3);
    const danoBase = 5 + ((nivel - 1) * 2);
    const velocidadeBase = (nivel - 1) * 0.5;
    const macasBase = 5;

    vidaMax = hpBase + bonus.hp;

    danoAtaque = danoBase + bonus.dano;

    agilidade = velocidadeBase + bonus.velocidade;

    macasMax = macasBase + bonus.macas;

    vida = Math.min(vida, vidaMax);
    macas = Math.min(macas, macasMax);

    $("lv-display").textContent = `LV ${nivel}`;
    $("hp-text").textContent = `${vida} / ${vidaMax}`;

    const percentual = Math.max(
        0,
        Math.min(100, vida / vidaMax * 100)
    );

    $("hp-bar-fill").style.width = `${percentual}%`;
}


/* =========================================
   STATUS DA FERA
========================================= */

function atualizarHpInimigo() {
    if (!animalAtual || !emCombate) {
        $("inimigo-hp-container").style.display = "none";
        return;
    }

    $("inimigo-hp-container").style.display = "block";

    $("inimigo-nome-display").textContent = animalAtual.nome;

    const percentual = Math.max(
        0,
        animalAtual.hp / animalAtual.hpMax * 100
    );

    $("inimigo-hp-fill").style.width = `${percentual}%`;
}


/* =========================================
   MOSTRAR FERA
========================================= */

function mostrarMonstro(mostrar = true, fala = "") {
    const img = $("monstro-img");
    const balao = $("balao-fala");

    const areaInimigo = $("inimigo-area");

    if (mostrar && animalAtual) {
        // A faixa da fera só ocupa espaço quando existe um encontro ativo.
        areaInimigo.style.display = "flex";
        img.src = animalAtual.imgSrc;
        img.style.display = "block";

        if (fala) {
            $("balao-texto").textContent = fala;
            balao.style.display = "block";
        } else {
            balao.style.display = "none";
        }

    } else {
        img.style.display = "none";
        balao.style.display = "none";
        areaInimigo.style.display = "none";
    }
}


/* =========================================
   CONTROLE DE TELAS
========================================= */

function ocultarModosDisplay() {
    caixaTexto.style.display = "none";
    arenaBox.style.display = "none";
    menuInterativo.style.display = "none";
}


function alternarBotoesCombate(emBatalha) {
    if (emBatalha) {
        botoesCombate.style.display = "grid";
        menuNavegacao.style.display = "none";

        indiceFocado = 0;

        atualizarFocoTeclado(
            "#botoes-principais .ut-btn"
        );

    } else {
        botoesCombate.style.display = "none";
        menuNavegacao.style.display = "grid";

        indiceFocado = 0;

        atualizarFocoTeclado(
            "#menu-navegacao .sub-btn"
        );
    }
}