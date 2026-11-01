/* =========================================
   DARK APPLES — COMBATE
========================================= */


/* =========================================
   LUTAR
========================================= */

function acaoLutar() {
    if (!emCombate || bloqueado || emFaseDesvio || ataqueEmAndamento) {
        return;
    }

    tocarSomAcao();

    abrirMenuOpcoes([
        {
            nome: "ATACAR",
            acao: resolverApunhalada
        },
        {
            nome: "VOLTAR",
            acao: restaurarTurno
        }
    ]);

    escreverTexto(
        `* Você encara ${animalAtual.nome}.\n* Escolha se deseja atacar.`
    );
}


/* =========================================
   RESOLVER ATAQUE
========================================= */

function resolverApunhalada() {
    if (
        !emCombate ||
        !animalAtual ||
        bloqueado ||
        emFaseDesvio ||
        ataqueEmAndamento
    ) {
        return;
    }

    // Bloqueia novos ataques neste turno.
    ataqueEmAndamento = true;

    tocarSomAcao();

    const dano = danoAtaque + Math.floor(Math.random() * 3);

    animalAtual.hp = Math.max(
        0,
        animalAtual.hp - dano
    );

    atualizarHpInimigo();

    ocultarModosDisplay();

    caixaTexto.style.display = "block";

    if (animalAtual.hp <= 0) {
        const almasGanhas = Math.floor(
            animalAtual.almas * 1.2
        );

        almas += almasGanhas;
        animaisDerrotados.push(animalAtual.nome);
        if (typeof salvarProgressoAtual === "function") salvarProgressoAtual();

        escreverTexto(
            `* ${animalAtual.nome} foi derrotado!\n* Você recebeu ${almasGanhas} Almas.`,
            () => {
                finalizarCombate();
            }
        );

        return;
    }

    escreverTexto(
        `* Você causou ${dano} de dano!\n* ${animalAtual.nome} ainda está de pé.`,
        () => {
            prepararAtaqueInimigo();
        }
    );
}


/* =========================================
   AGIR
========================================= */

function acaoAgir() {
    if (!emCombate || bloqueado || emFaseDesvio || ataqueEmAndamento) {
        return;
    }

    tocarSomAcao();

    const acoes = [
        "PACIFICAÇÃO",
        "INTIMIDAÇÃO",
        "ACARICIAR",
        "ACALMAR",
        "CHECAR",
        "VOLTAR"
    ];

    abrirMenuOpcoes(
        acoes.map(nome => ({
            nome,
            acao: () => executarAcao(nome)
        }))
    );

    escreverTexto(
        `* Você tenta compreender ${animalAtual.nome}.\n* Escolha uma interação.`
    );
}


function executarAcao(acao) {
    if (
        !animalAtual ||
        bloqueado ||
        ataqueEmAndamento
    ) {
        return;
    }

    if (acao === "VOLTAR") {
        restaurarTurno();
        return;
    }

    // Impede repetir ações no mesmo turno.
    ataqueEmAndamento = true;

    tocarSomAcao();

    ocultarModosDisplay();

    caixaTexto.style.display = "block";

    if (acao === "CHECAR") {
        escreverTexto(
            `* ${animalAtual.nome}\n* HP: ${animalAtual.hp}/${animalAtual.hpMax}\n* ${animalAtual.dicaAcao}\n* Você analisou a fera. Sua vez continua.`,
            () => {
                // CHECAR é apenas informativo: não consome o turno nem chama a arena.
                restaurarTurno();
            }
        );

        return;
    }

    const acaoCorreta = animalAtual.acaoCerta.toUpperCase();

    let mensagem = "";
    let ganho = 0;

    if (acao === acaoCorreta) {
        ganho = 40;

        mensagem = `* ${animalAtual.nome} parece confiar um pouco mais em você!`;

    } else if (
        acao === "PACIFICAÇÃO" ||
        acao === "INTIMIDAÇÃO" ||
        acao === "ACARICIAR" ||
        acao === "ACALMAR"
    ) {
        ganho = 15;

        mensagem = `* ${animalAtual.nome} observa sua atitude com curiosidade.`;
    }

    misericordia = Math.min(
        100,
        misericordia + ganho
    );

    animalAtual.misericordia = misericordia;

    escreverTexto(
        `${mensagem}\n* Piedade: ${misericordia}%`,
        () => {
            setTimeout(() => prepararAtaqueInimigo(), 900);
        }
    );
}


/* =========================================
   ITENS
========================================= */

function acaoItem() {
    if (
        !emCombate ||
        bloqueado ||
        emFaseDesvio ||
        ataqueEmAndamento
    ) {
        return;
    }

    tocarSomAcao();

    abrirMenuOpcoes([
        {
            nome: `MAÇÃ (${macas}/${macasMax})`,
            acao: usarMaca
        },
        {
            nome: "VOLTAR",
            acao: restaurarTurno
        }
    ]);

    escreverTexto(
        "* Você procura algo na sua mochila."
    );
}


/* =========================================
   USAR MAÇÃ
========================================= */

function usarMaca() {
    if (
        !emCombate ||
        !animalAtual ||
        bloqueado ||
        emFaseDesvio ||
        ataqueEmAndamento
    ) {
        return;
    }

    if (macas <= 0) {
        escreverTexto("* Você não tem mais maçãs!");
        return;
    }

    if (vida >= vidaMax) {
        escreverTexto("* Seu HP já está cheio!");
        return;
    }

    // Trava imediatamente para não consumir outra maçã.
    ataqueEmAndamento = true;

    macas--;

    const cura = Math.min(
        10,
        vidaMax - vida
    );

    vida += cura;

    atualizarStatus();

    tocarSomBeep(520, 0.15, "sine");

    ocultarModosDisplay();

    caixaTexto.style.display = "block";

    escreverTexto(
        `* Você comeu uma Maçã Vermelha.\n* Recuperou ${cura} HP!`,
        () => {
            setTimeout(() => prepararAtaqueInimigo(), 900);
        }
    );
}


/* =========================================
   PIEDADE
========================================= */

function acaoPiedade() {
    if (
        !emCombate ||
        bloqueado ||
        emFaseDesvio ||
        ataqueEmAndamento
    ) {
        return;
    }

    tocarSomAcao();

    if (misericordia < 100) {
        ataqueEmAndamento = true;

        escreverTexto(
            `* ${animalAtual.nome} ainda não está pronto para partir.\n* Piedade: ${misericordia}%`,
            () => {
                setTimeout(() => prepararAtaqueInimigo(), 1000);
            }
        );

        return;
    }

    const almasGanhas = animalAtual.almas;

    animaisCapturados.push(animalAtual.nome);

    almas += almasGanhas;
    if (typeof salvarProgressoAtual === "function") salvarProgressoAtual();

    ataqueEmAndamento = true;

    ocultarModosDisplay();

    caixaTexto.style.display = "block";

    mostrarMonstro(false);

    escreverTexto(
        `* Você poupou ${animalAtual.nome}!\n* Recebeu ${almasGanhas} Almas.`,
        () => {
            finalizarCombate();
        }
    );
}


/* =========================================
   TURNO DO INIMIGO
========================================= */

function prepararAtaqueInimigo() {
    if (!emCombate || !animalAtual) return;

    ocultarModosDisplay();

    menuInterativo.style.display = "grid";

    menuInterativo.innerHTML = "";

    const botao = document.createElement("button");

    botao.className = "opcao-ut focado";

    botao.textContent = "♥ DESVIAR DO ATAQUE";

    botao.onclick = iniciarFaseAtaqueInimigo;

    menuInterativo.appendChild(botao);

    escreverTexto(
        `* ${animalAtual.nome} está preparando um ataque!\n* Prepare-se para desviar.`
    );

    indiceFocado = 0;

    atualizarFocoTeclado(".opcao-ut");
}


function iniciarFaseAtaqueInimigo() {
    if (emFaseDesvio || !emCombate) return;

    tocarSomAcao();

    emFaseDesvio = true;

    ocultarModosDisplay();
    const displayPrincipal = $("display-principal");
    displayPrincipal.classList.remove("modo-fogueira");
    displayPrincipal.classList.add("modo-arena");

    arenaBox.style.display = "flex";

    iniciarArena();
}