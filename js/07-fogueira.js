/* =========================================
   DARK APPLES — FOGUEIRA
========================================= */

let animFogueiraId = null;

let faiscas = [];


/* =========================================
   FOGUEIRA
========================================= */

function fogueira() {
    if (emCombate || bloqueado) return;

    tocarSomAcao();

    pararParticulasFogueira();

    // Recupera completamente o jogador.
    vida = vidaMax;
    macas = macasMax;

    atualizarStatus();
    if (typeof salvarProgressoAtual === "function") salvarProgressoAtual();

    ocultarModosDisplay();

    caixaTexto.style.display = "none";

    const display = $("display-principal");
    display.classList.remove("modo-arena");
    display.classList.add("modo-fogueira");
    display.style.background = "";

    iniciarParticulasFogueira();

    abrirMenuOpcoesFogueira();
}


/* =========================================
   MENU DA FOGUEIRA
========================================= */

function abrirMenuOpcoesFogueira(aviso = "") {
    menuInterativo.style.display = "grid";

    menuInterativo.innerHTML = `

        <div style="
            grid-column: span 2;
            font-size: 9px;
            line-height: 2;
            padding: 8px;
        ">

            * Você descansa perto da fogueira.<br>
            * Seu HP e suas maçãs foram restaurados.<br>
            * Almas: ${almas}
            ${aviso ? `<div class="aviso-fogueira">${aviso}</div>` : ""}

        </div>

        <button
            class="opcao-ut"
            onclick="evoluirNivel()"
        >
            EVOLUIR LV
        </button>

        <button
            class="opcao-ut"
            onclick="voltarDaFogueira()"
        >
            CONTINUAR
        </button>

    `;

    indiceFocado = 0;

    atualizarFocoTeclado(".opcao-ut");
}


/* =========================================
   VOLTAR DA FOGUEIRA
========================================= */

function voltarDaFogueira() {
    pararParticulasFogueira();

    $("display-principal").classList.remove("modo-fogueira");
    $("display-principal").style.background = "";

    restaurarMenu();
}


/* =========================================
   INICIAR PARTÍCULAS
========================================= */

function iniciarParticulasFogueira() {
    const canvas = $("canvasFogueira");

    canvas.style.display = "block";

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const ctx = canvas.getContext("2d");

    faiscas = [];

    function animar() {
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        if (faiscas.length < 30) {
            faiscas.push({
                x: Math.random() * canvas.width,
                y: canvas.height,
                vx: (Math.random() - 0.5) * 0.7,
                vy: -Math.random() * 2 - 0.5,
                vida: 1,
                tamanho: Math.random() * 3 + 1
            });
        }

        faiscas.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            p.vida -= 0.015;

            ctx.globalAlpha = Math.max(0, p.vida);

            ctx.fillStyle =
                Math.random() > 0.5
                    ? "#ff6600"
                    : "#ffcc00";

            ctx.fillRect(
                p.x,
                p.y,
                p.tamanho,
                p.tamanho
            );

            if (p.vida <= 0) {
                faiscas.splice(i, 1);
            }
        });

        ctx.globalAlpha = 1;

        animFogueiraId = requestAnimationFrame(animar);
    }

    pararParticulasFogueira();

    animar();
}


/* =========================================
   PARAR PARTÍCULAS
========================================= */

function pararParticulasFogueira() {
    if (animFogueiraId) {
        cancelAnimationFrame(animFogueiraId);
        animFogueiraId = null;
    }

    const canvas = $("canvasFogueira");

    if (canvas) {
        canvas.style.display = "none";

        canvas.getContext("2d").clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    // Não força um fundo preto inline: o CSS escolhe o cenário do modo atual.
    if ($("display-principal")) $("display-principal").style.background = "";
}