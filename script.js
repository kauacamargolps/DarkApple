/* =========================================
   SISTEMA DE ÁUDIO CHIPTUNE
========================================= */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarSomBeep(freq = 440, duracao = 0.05, tipo = "square") {
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = tipo;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duracao);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duracao);
    } catch (e) { }
}

function tocarSomDano() {
    tocarSomBeep(120, 0.25, "sawtooth");
}

function tocarSomAcao() {
    tocarSomBeep(587.33, 0.08, "square");
}

function tocarSomLevelUp() {
    const notas = [261.63, 329.63, 392.00, 523.25];
    notas.forEach((freq, idx) => {
        setTimeout(() => tocarSomBeep(freq, 0.1, "triangle"), idx * 80);
    });
}

/* =========================================
   CONTROLE DA TELA INICIAL
========================================= */
let jogoIniciado = false;

function iniciarJogo() {
    if (jogoIniciado) return;
    jogoIniciado = true;

    tocarSomAcao();

    const telaInicio = document.getElementById("tela-inicio");
    if (telaInicio) {
        telaInicio.style.opacity = "0";
        telaInicio.style.transition = "opacity 0.5s ease";

        setTimeout(() => {
            telaInicio.style.display = "none";
            const undertaleBox = document.getElementById("undertale-box");
            if (undertaleBox) undertaleBox.style.display = "flex";

            restaurarMenu();
        }, 500);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const btnStart = document.getElementById("btn-iniciar-jogo");
    if (btnStart) btnStart.classList.add("focado");
});

/* =========================================
   EFEITO VISUAL DE FAÍSCAS NA FOGUEIRA
========================================= */
let animFogueiraId = null;
let faiscas = [];

function iniciarParticulasFogueira() {
    const canvas = document.getElementById("canvasFogueira");
    if (!canvas) return;
    canvas.style.display = "block";
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const ctx = canvas.getContext("2d");
    faiscas = [];

    function animar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (faiscas.length < 25) {
            faiscas.push({
                x: canvas.width * 0.2 + Math.random() * (canvas.width * 0.6),
                y: canvas.height - 10,
                vx: (Math.random() - 0.5) * 0.8,
                vy: -Math.random() * 1.8 - 0.6,
                tamanho: Math.random() * 3 + 1,
                vida: 1.0,
                cor: Math.random() > 0.3 ? "#ff4500" : "#ffcc00"
            });
        }

        for (let i = faiscas.length - 1; i >= 0; i--) {
            let p = faiscas[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vida -= 0.015;

            ctx.fillStyle = p.cor;
            ctx.globalAlpha = Math.max(0, p.vida);
            ctx.fillRect(p.x, p.y, p.tamanho, p.tamanho);

            if (p.vida <= 0 || p.y < 0) {
                faiscas.splice(i, 1);
            }
        }

        ctx.globalAlpha = 1.0;
        animFogueiraId = requestAnimationFrame(animar);
    }

    if (animFogueiraId) cancelAnimationFrame(animFogueiraId);
    animar();
}

function pararParticulasFogueira() {
    if (animFogueiraId) {
        cancelAnimationFrame(animFogueiraId);
        animFogueiraId = null;
    }
    const canvas = document.getElementById("canvasFogueira");
    if (canvas) canvas.style.display = "none";
}

/* =========================================
   SISTEMA DE SKINS / PERSONAGENS
========================================= */
const skinsDisponiveis = {
    rei: {
        nome: "Soberano Fenrir",
        imgSrc: "assets/img/heroi_rei.png",
        descricao: "👑 Rei Supremo (+5 HP Max)"
    },
    rainha: {
        nome: "Rainha Fenrys",
        imgSrc: "assets/img/heroi_rainha.png",
        descricao: "👸 Nobre (+8 HP Max)"
    },
    cavaleiro: {
        nome: "Cavaleiro Imperial",
        imgSrc: "assets/img/heroi_cavaleiro.png",
        descricao: "🛡️ Tanque (+10 HP Max)"
    },
    arqueiro: {
        nome: "Arqueiro das Sombras",
        imgSrc: "assets/img/heroi_arqueiro.png",
        descricao: "💨 Veloz (+2 Agilidade)"
    },
    mago: {
        nome: "Mago Arcano",
        imgSrc: "assets/img/heroi_mago.png",
        descricao: "🔮 Mestre (+3 Dano)"
    },
    domador: {
        nome: "Domador de Feras",
        imgSrc: "assets/img/heroi_domador.png",
        descricao: "🍎 Maçãs (+3 Maçãs Max)"
    }
};

let skinAtual = "rei";

const heroiImg = new Image();
heroiImg.src = skinsDisponiveis[skinAtual].imgSrc;

/* =========================================
   ESTADO GLOBAL DO JOGO
========================================= */
let nivel = 1;
let almas = 0;
let almasNecessarias = 30;

let vidaMax = 20;
let vida = vidaMax;
let danoAtaque = 5;
let agilidade = 0;

let macasMax = 5;
let macas = macasMax;

let animaisCapturados = [];
let animalAtual = null;

let emCombate = false;
let emFaseDesvio = false;

// NAVEGAÇÃO DE TECLADO
let botoesAtivos = [];
let indiceFocado = 0;

/* =========================================
   SISTEMA DE SELEÇÃO E NAVEGAÇÃO VIA TECLADO
========================================= */
function atualizarFocoTeclado(grupoSelector) {
    document.querySelectorAll(".focado").forEach(el => el.classList.remove("focado"));

    const lista = Array.from(document.querySelectorAll(grupoSelector)).filter(
        el => el.offsetWidth > 0 && el.offsetHeight > 0
    );

    botoesAtivos = lista;

    if (botoesAtivos.length > 0) {
        if (indiceFocado >= botoesAtivos.length) indiceFocado = 0;
        if (indiceFocado < 0) indiceFocado = botoesAtivos.length - 1;

        botoesAtivos[indiceFocado].classList.add("focado");
    }
}

window.addEventListener("keydown", (e) => {
    // ATALHO PARA TELA INICIAL
    if (!jogoIniciado) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            iniciarJogo();
        }
        return;
    }

    if (emFaseDesvio) return; // Pausa a navegação de menus durante a fase de desvio

    // TECLA DE VOLTAR / CANCELAR (ESC, X, BACKSPACE)
    if (e.key === "Escape" || e.key.toLowerCase() === "x" || e.key === "Backspace") {
        if (emCombate) {
            e.preventDefault();
            tocarSomBeep(300, 0.04, "square");

            ocultarModosDisplay();
            document.getElementById("caixa-texto").style.display = "block";
            escreverTexto(`* O combate contra ${animalAtual.nome} continua!\n* O que você fará?`);

            indiceFocado = 1; // Foca direto no botão AGIR
            atualizarFocoTeclado("#botoes-principais .ut-btn");
            return;
        }
    }

    // NAVEGAÇÃO DE SETA PARA BAIXO (DESCE DO SUBMENU PARA OS BOTÕES INFERIORES)
    if (e.key === "ArrowDown") {
        const estaEmSubmenu = document.getElementById("menu-interativo").style.display === "grid";
        if (estaEmSubmenu && (indiceFocado === 2 || indiceFocado === 3 || botoesAtivos.length <= 2)) {
            e.preventDefault();
            tocarSomBeep(400, 0.02, "square");
            indiceFocado = 1; // Desce para o botão AGIR
            atualizarFocoTeclado("#botoes-principais .ut-btn");
            return;
        }
    }

    // NAVEGAÇÃO DE SETA PARA CIMA (SOBE DOS BOTÕES INFERIORES PARA O SUBMENU)
    if (e.key === "ArrowUp") {
        const estaEmSubmenu = document.getElementById("menu-interativo").style.display === "grid";
        const emBotoesPrincipais = botoesAtivos.length > 0 && botoesAtivos[0].classList.contains("ut-btn");
        if (estaEmSubmenu && emBotoesPrincipais) {
            e.preventDefault();
            tocarSomBeep(400, 0.02, "square");
            indiceFocado = 0; // Sobe para a primeira opção do submenu
            atualizarFocoTeclado(".opcao-ut");
            return;
        }
    }

    // NAVEGAÇÃO PADRÃO COM SETAS E ENTER
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        tocarSomBeep(400, 0.02, "square");
        indiceFocado++;
        mantenhaFocoAtual();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        tocarSomBeep(400, 0.02, "square");
        indiceFocado--;
        mantenhaFocoAtual();
    } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (botoesAtivos[indiceFocado]) {
            botoesAtivos[indiceFocado].click();
        }
    }
});

function mantenhaFocoAtual() {
    if (botoesAtivos.length === 0) return;
    if (indiceFocado >= botoesAtivos.length) indiceFocado = 0;
    if (indiceFocado < 0) indiceFocado = botoesAtivos.length - 1;

    document.querySelectorAll(".focado").forEach(el => el.classList.remove("focado"));
    botoesAtivos[indiceFocado].classList.add("focado");
}

/* =========================================
   EFEITO DE DIGITAÇÃO (TYPEWRITER)
========================================= */
let intervaloTexto = null;

function escreverTexto(texto, callback = null) {
    const el = document.getElementById("narrativa-texto");
    el.innerText = "";
    let index = 0;

    if (intervaloTexto) clearInterval(intervaloTexto);

    intervaloTexto = setInterval(() => {
        if (index < texto.length) {
            const charAtual = texto.charAt(index);
            el.innerText += charAtual;

            if (charAtual !== " " && charAtual !== "\n") {
                tocarSomBeep(300 + Math.random() * 50, 0.03, "square");
            }
            index++;
        } else {
            clearInterval(intervaloTexto);
            if (callback) callback();
        }
    }, 24);
}

/* =========================================
   ATUALIZAÇÃO DE INTERFACE
========================================= */
function atualizarStatus() {
    document.getElementById("lv-display").innerText = `LV ${nivel}`;
    document.getElementById("hp-text").innerText = `${vida} / ${vidaMax}`;

    const percentual = Math.max(0, Math.min(100, (vida / vidaMax) * 100));
    document.getElementById("hp-bar-fill").style.width = `${percentual}%`;
}

function mostrarMonstro(mostrar = true, fala = "") {
    const img = document.getElementById("monstro-img");
    const balao = document.getElementById("balao-fala");
    const areaInimigo = document.getElementById("inimigo-area");

    if (mostrar && animalAtual) {
        areaInimigo.classList.add("em-combate-ativo");
        img.src = animalAtual.imgSrc;
        img.style.display = "block";

        if (fala) {
            document.getElementById("balao-texto").innerText = fala;
            balao.style.display = "block";
        } else {
            balao.style.display = "none";
        }
    } else {
        areaInimigo.classList.remove("em-combate-ativo");
        img.style.display = "none";
        balao.style.display = "none";
    }
}

function alternarBotoesCombate(emBatalha) {
    const botoesCombate = document.getElementById("botoes-principais");
    const menuNavegacao = document.getElementById("menu-navegacao");

    if (emBatalha) {
        botoesCombate.style.display = "grid";
        menuNavegacao.style.display = "none";
        indiceFocado = 0;
        atualizarFocoTeclado("#botoes-principais .ut-btn");
    } else {
        botoesCombate.style.display = "none";
        menuNavegacao.style.display = "grid";
        indiceFocado = 0;
        atualizarFocoTeclado("#menu-navegacao .sub-btn");
    }
}

function ocultarModosDisplay() {
    document.getElementById("caixa-texto").style.display = "none";
    document.getElementById("arena-box").style.display = "none";
    document.getElementById("menu-interativo").style.display = "none";
}

function removerFundoFogueira() {
    pararParticulasFogueira();
    document.getElementById("display-principal").classList.remove("em-fogueira");
}

/* =========================================
   FLUXO DO JOGO & COMBATE
========================================= */
function explorar() {
    tocarSomAcao();
    removerFundoFogueira();
    emCombate = true;
    emFaseDesvio = false;

    // Seleciona uma fera aleatória
    animalAtual = Object.assign({}, inimigos[Math.floor(Math.random() * inimigos.length)]);
    animalAtual.chancePiedade = animalAtual.chancePiedade || 20;

    mostrarMonstro(true, animalAtual.fala);
    ocultarModosDisplay();
    document.getElementById("caixa-texto").style.display = "block";

    alternarBotoesCombate(true);

    escreverTexto(`* ${animalAtual.nome} apareceu!\n* Escolha uma ação para interagir.`, () => {
        indiceFocado = 0;
        atualizarFocoTeclado("#botoes-principais .ut-btn");
    });
}

function prepararAtaqueInimigo(mensagemAcao) {
    ocultarModosDisplay();
    const menu = document.getElementById("menu-interativo");
    menu.style.display = "grid";

    menu.innerHTML = `
        <div class="opcao-ut focado" id="btn-defender" onclick="iniciarFaseAtaqueInimigo()" style="grid-column: span 2; text-align: center;">
            🛡️ DEFENDER-SE (ENTER)
        </div>
    `;

    // Garante que o botão de defesa venha pré-selecionado pelo teclado
    indiceFocado = 0;
    atualizarFocoTeclado(".opcao-ut");

    escreverTexto(`${mensagemAcao}\n* O(a) ${animalAtual.nome} prepara um ataque!`, () => {
        indiceFocado = 0;
        atualizarFocoTeclado(".opcao-ut");
    });
}

/* =========================================
   AÇÕES DE COMBATE
========================================= */
function açaoLutar() {
    if (!emCombate || !animalAtual || emFaseDesvio) return;
    tocarSomAcao();

    const danoCausado = danoAtaque + Math.floor(Math.random() * 3);
    tocarSomBeep(600, 0.1, "sawtooth");

    prepararAtaqueInimigo(`* Você atacou ${animalAtual.nome} e causou ${danoCausado} de dano!`);
}

function açaoAgir() {
    if (!emCombate || !animalAtual || emFaseDesvio) return;
    tocarSomAcao();

    ocultarModosDisplay();
    const menu = document.getElementById("menu-interativo");
    menu.style.display = "grid";

    menu.innerHTML = `
        <div class="opcao-ut" onclick="executarAcao('Checar')">🔍 Checar</div>
        <div class="opcao-ut" onclick="executarAcao('Pacificação')">🕊️ Pacificação</div>
        <div class="opcao-ut" onclick="executarAcao('Intimidação')">💥 Intimidação</div>
        <div class="opcao-ut" onclick="executarAcao('Acariciar')">✋ Acariciar</div>
    `;

    indiceFocado = 0;
    atualizarFocoTeclado(".opcao-ut");
}

function executarAcao(tipo) {
    tocarSomAcao();
    let msg = "";

    if (tipo === "Checar") {
        animalAtual.chancePiedade = Math.min(100, animalAtual.chancePiedade + 20);
        msg = `* ${animalAtual.nome} - ATK ${animalAtual.dano} DEF 2.\n* DICA: ${animalAtual.dicaAcao}\n* (Chance de Piedade: ${animalAtual.chancePiedade}%)`;
    } 
    else if (tipo === "Pacificação") {
        animalAtual.velocidade = Math.max(2.0, animalAtual.velocidade - 1.0);
        if (animalAtual.acaoCerta === "Pacificação" || animalAtual.acaoCerta === "Acalmar") {
            animalAtual.chancePiedade = 100;
            msg = `* Você pacifica a fera com sucesso!\n* ${animalAtual.nome} aceitou a paz completamente! (100% Piedade)`;
        } else {
            animalAtual.chancePiedade = Math.min(100, animalAtual.chancePiedade + 25);
            msg = `* Você tenta pacificar ${animalAtual.nome}.\n* A velocidade do ataque dele diminuiu! (Chance de Piedade: ${animalAtual.chancePiedade}%)`;
        }
    } 
    else if (tipo === "Intimidação") {
        animalAtual.dano = Math.max(2, animalAtual.dano - 2);
        if (animalAtual.acaoCerta === "Intimidação") {
            animalAtual.chancePiedade = 100;
            msg = `* Você impõe sua DETERMINAÇÃO!\n* ${animalAtual.nome} recuou com respeito! (100% Piedade)`;
        } else {
            animalAtual.chancePiedade = Math.min(100, animalAtual.chancePiedade + 25);
            msg = `* Você encara ${animalAtual.nome}.\n* O dano do ataque dele caiu! (Chance de Piedade: ${animalAtual.chancePiedade}%)`;
        }
    } 
    else if (tipo === "Acariciar") {
        if (animalAtual.acaoCerta === "Acariciar") {
            animalAtual.chancePiedade = 100;
            msg = `* Você acaricia a fera suavemente.\n* ${animalAtual.nome} confiou em você! (100% Piedade)`;
        } else {
            animalAtual.chancePiedade = Math.min(100, animalAtual.chancePiedade + 15);
            msg = `* Você afaga ${animalAtual.nome}, mas ele ainda hesita.\n* (Chance de Piedade: ${animalAtual.chancePiedade}%)`;
        }
    }

    prepararAtaqueInimigo(msg);
}

function açaoItem() {
    if (!emCombate || emFaseDesvio) return;
    tocarSomAcao();

    ocultarModosDisplay();
    const menu = document.getElementById("menu-interativo");
    menu.style.display = "grid";

    menu.innerHTML = `
        <div class="opcao-ut" onclick="usarMaca()" style="grid-column: span 2;">Maçã (${macas}/${macasMax})</div>
    `;

    indiceFocado = 0;
    atualizarFocoTeclado(".opcao-ut");
}

function usarMaca() {
    tocarSomAcao();

    if (macas > 0) {
        macas--;
        vida = Math.min(vidaMax, vida + 10);
        atualizarStatus();
        tocarSomBeep(523, 0.15, "sine");

        prepararAtaqueInimigo(`* Você comeu uma Maçã Vermelha e recuperou 10 de HP!`);
    } else {
        ocultarModosDisplay();
        document.getElementById("caixa-texto").style.display = "block";
        escreverTexto(`* Você não tem mais Maçãs!`, () => {
            setTimeout(() => {
                alternarBotoesCombate(true);
            }, 1000);
        });
    }
}

function açaoPiedade() {
    if (!emCombate || !animalAtual || emFaseDesvio) return;
    tocarSomAcao();

    ocultarModosDisplay();
    document.getElementById("caixa-texto").style.display = "block";

    const chanceSorte = animalAtual.chancePiedade || 20;
    const rollSorte = Math.floor(Math.random() * 100) + 1;

    if (rollSorte <= chanceSorte) {
        animaisCapturados.push(animalAtual.nome);
        const almasGanha = animalAtual.almas;
        almas += almasGanha;

        escreverTexto(`* PIEDADE BEM-SUCEDIDA!\n* Você poupou ${animalAtual.nome} e absorveu ${almasGanha} Almas!`, () => {
            setTimeout(() => {
                restaurarMenu();
            }, 1600);
        });
    } else {
        tocarSomBeep(180, 0.2, "sawtooth");
        prepararAtaqueInimigo(`* PIEDADE FALHOU! (${rollSorte}% > ${chanceSorte}%)\n* ${animalAtual.nome} recusou sua oferta e atacou!`);
    }
}

/* =========================================
   ARENA COM O SPRITE DA SKIN EQUIPADA (BULLET HELL)
========================================= */
let canvasArena, ctxArena;
let heroiX = 250, heroiY = 110;
let projeteis = [];
let tempoSobrevivencia = 0;
let loopArenaId = null;
let teclasGame = { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false };

function iniciarFaseAtaqueInimigo() {
    emFaseDesvio = true;
    ocultarModosDisplay();
    document.getElementById("arena-box").style.display = "flex";

    canvasArena = document.getElementById("canvasArena");
    ctxArena = canvasArena.getContext("2d");

    heroiX = canvasArena.width / 2;
    heroiY = canvasArena.height / 2;

    projeteis = [];
    for (let i = 0; i < animalAtual.quantidade; i++) {
        projeteis.push({
            x: Math.random() * (canvasArena.width - 20) + 10,
            y: -(i * 40) - 20,
            vy: animalAtual.velocidade + Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 1.5
        });
    }

    tempoSobrevivencia = animalAtual.tempoLuta;

    const keyHandler = (e, isDown) => {
        if (teclasGame.hasOwnProperty(e.key)) {
            teclasGame[e.key] = isDown;
        }
    };

    window.onkeydown = (e) => keyHandler(e, true);
    window.onkeyup = (e) => keyHandler(e, false);

    if (loopArenaId) clearInterval(loopArenaId);
    loopArenaId = setInterval(loopArena, 1000 / 60);
}

function loopArena() {
    const speed = 3.5 + agilidade * 0.4;
    const tamHeroi = 28;

    if (teclasGame.ArrowLeft) heroiX = Math.max(tamHeroi / 2, heroiX - speed);
    if (teclasGame.ArrowRight) heroiX = Math.min(canvasArena.width - tamHeroi / 2, heroiX + speed);
    if (teclasGame.ArrowUp) heroiY = Math.max(tamHeroi / 2, heroiY - speed);
    if (teclasGame.ArrowDown) heroiY = Math.min(canvasArena.height - tamHeroi / 2, heroiY + speed);

    ctxArena.fillStyle = "#000000";
    ctxArena.fillRect(0, 0, canvasArena.width, canvasArena.height);

    if (heroiImg.complete && heroiImg.naturalWidth !== 0) {
        ctxArena.drawImage(heroiImg, heroiX - tamHeroi / 2, heroiY - tamHeroi / 2, tamHeroi, tamHeroi);
    } else {
        ctxArena.fillStyle = "#ff0000";
        ctxArena.fillRect(heroiX - 8, heroiY - 8, 16, 16);
    }

    ctxArena.fillStyle = "#ffffff";
    for (let p of projeteis) {
        p.y += p.vy;
        p.x += p.vx;

        if (p.y > canvasArena.height) {
            p.y = -10;
            p.x = Math.random() * (canvasArena.width - 20) + 10;
        }

        ctxArena.beginPath();
        ctxArena.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctxArena.fill();

        const dx = heroiX - p.x;
        const dy = heroiY - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < 14) {
            clearInterval(loopArenaId);
            emFaseDesvio = false;
            tocarSomDano();

            vida -= animalAtual.dano;
            atualizarStatus();

            ocultarModosDisplay();
            document.getElementById("caixa-texto").style.display = "block";

            if (vida <= 0) {
                escreverTexto(`* Você perdeu toda a sua DETERMINAÇÃO...`, () => {
                    setTimeout(() => {
                        vida = vidaMax;
                        atualizarStatus();
                        restaurarMenu();
                    }, 2000);
                });
            } else {
                escreverTexto(`* Você tomou ${animalAtual.dano} de dano!`, () => {
                    setTimeout(() => {
                        ocultarModosDisplay();
                        document.getElementById("caixa-texto").style.display = "block";
                        alternarBotoesCombate(true);
                        escreverTexto(`* O combate continua! O que você fará?`);
                    }, 1200);
                });
            }
            return;
        }
    }

    tempoSobrevivencia -= 1 / 60;
    if (tempoSobrevivencia <= 0) {
        clearInterval(loopArenaId);
        emFaseDesvio = false;
        ocultarModosDisplay();
        document.getElementById("caixa-texto").style.display = "block";

        escreverTexto(`* Você sobreviveu ao ataque!`, () => {
            setTimeout(() => {
                ocultarModosDisplay();
                document.getElementById("caixa-texto").style.display = "block";
                alternarBotoesCombate(true);
                escreverTexto(`* É o seu turno! O que você fará?`);
            }, 1000);
        });
    }
}

/* =========================================
   FOGUEIRA, CENA DE DESCANSO E EVOLUÇÃO
========================================= */
function fogueira() {
    tocarSomAcao();
    emCombate = false;
    mostrarMonstro(false);
    alternarBotoesCombate(false);

    const display = document.getElementById("display-principal");
    display.classList.add("em-fogueira");
    iniciarParticulasFogueira();

    vida = vidaMax;
    macas = macasMax;
    atualizarStatus();

    ocultarModosDisplay();

    const menu = document.getElementById("menu-interativo");
    menu.style.display = "grid";

    menu.innerHTML = `
        <div class="opcao-ut" onclick="evoluirNivel()" style="grid-column: span 2; text-align: center;">
            🔮 EVOLUIR LEVEL (Custo: ${almasNecessarias} Almas | Você tem: ${almas})
        </div>
    `;

    escreverTexto(`* Você descansa perto das chamas acesas.\n* HP e Maçãs restaurados.\n* Almas: ${almas} | Custo Próximo LV: ${almasNecessarias}`);

    setTimeout(() => {
        indiceFocado = 0;
        atualizarFocoTeclado(".opcao-ut");
    }, 100);
}

function evoluirNivel() {
    if (almas >= almasNecessarias) {
        almas -= almasNecessarias;
        nivel++;
        almasNecessarias = Math.floor(almasNecessarias * 1.5);

        vidaMax += 3;
        vida = vidaMax;
        danoAtaque += 2;
        agilidade += 0.5;

        atualizarStatus();
        tocarSomLevelUp();

        ocultarModosDisplay();
        document.getElementById("caixa-texto").style.display = "block";

        escreverTexto(`* SEU LEVEL AUMENTOU PARA LV ${nivel}!\n* +3 HP Max | +2 Dano | +0.5 Agilidade!\n* Preenchido com DETERMINAÇÃO.`, () => {
            setTimeout(() => {
                fogueira();
            }, 1800);
        });
    } else {
        tocarSomBeep(150, 0.2, "sawtooth");
        ocultarModosDisplay();
        document.getElementById("caixa-texto").style.display = "block";

        escreverTexto(`* Almas insuficientes! Você precisa de ${almasNecessarias} Almas para o próximo LV.`, () => {
            setTimeout(() => {
                fogueira();
            }, 1500);
        });
    }
}

function restaurarMenu() {
    emCombate = false;
    emFaseDesvio = false;
    mostrarMonstro(false);
    alternarBotoesCombate(false);
    removerFundoFogueira();

    ocultarModosDisplay();
    document.getElementById("caixa-texto").style.display = "block";
    escreverTexto(`* O caminho se abre à sua frente.\n* O que você fará?`);
}

function mostrarInventario() {
    tocarSomAcao();
    removerFundoFogueira();
    const modalTexto = document.getElementById("modal-texto");

    if (animaisCapturados.length === 0) {
        modalTexto.innerText = "* Sua lista de feras poupadas está vazia.";
    } else {
        const contagem = {};
        animaisCapturados.forEach(nome => {
            contagem[nome] = (contagem[nome] || 0) + 1;
        });

        let html = `* FERAS POUPADAS:<br><div class="grid-bestiario">`;

        for (const [nome, qtd] of Object.entries(contagem)) {
            const dados = inimigos.find(i => i.nome === nome);
            const imgPath = dados ? dados.imgSrc : "assets/img/animais/pombo.png";

            html += `
                <div class="card-bestiario">
                    <img src="${imgPath}" alt="${nome}">
                    <div class="card-bestiario-nome">${nome}</div>
                    <div class="card-bestiario-qtd">x${qtd}</div>
                </div>
            `;
        }

        html += `</div>`;
        modalTexto.innerHTML = html;
    }

    document.getElementById("modal-overlay").style.display = "flex";
    indiceFocado = 0;
    atualizarFocoTeclado(".modal-btn");
}

/* =========================================
   SELEÇÃO DE SKINS / PERSONAGENS
========================================= */
function abrirSelecaoSkins() {
    tocarSomAcao();
    removerFundoFogueira();

    const modalTexto = document.getElementById("modal-texto");

    let html = `* ESCOLHA SEU PERSONAGEM / SKIN:<br><div class="grid-skins">`;

    for (const [chave, skin] of Object.entries(skinsDisponiveis)) {
        const ehAtual = chave === skinAtual;
        const classeStatus = ehAtual ? "card-skin skin-equipada" : "card-skin";

        html += `
            <div class="${classeStatus}" onclick="equiparSkin('${chave}')">
                <img src="${skin.imgSrc}" alt="${skin.nome}">
                <div class="card-skin-nome">${skin.nome}</div>
                <div class="card-skin-desc">${skin.descricao}</div>
                ${ehAtual ? '<div style="font-size: 7px; color: #00ff00; margin-top: 4px;">[EQUIPADO]</div>' : ''}
            </div>
        `;
    }

    html += `</div>`;
    modalTexto.innerHTML = html;

    document.getElementById("modal-overlay").style.display = "flex";
    indiceFocado = 0;
    atualizarFocoTeclado(".card-skin, .modal-btn");
}

function equiparSkin(chave) {
    if (!skinsDisponiveis[chave]) return;

    tocarSomAcao();
    skinAtual = chave;
    heroiImg.src = skinsDisponiveis[chave].imgSrc;

    let hpBonus = 0;
    let danoBonus = 0;
    let agilidadeBonus = 0;

    if (chave === "rei") hpBonus = 5;
    if (chave === "rainha") hpBonus = 8;
    if (chave === "cavaleiro") hpBonus = 10;
    if (chave === "arqueiro") agilidadeBonus = 2;
    if (chave === "mago") danoBonus = 3;
    if (chave === "domador") macasMax = 8; else macasMax = 5;

    vidaMax = 20 + ((nivel - 1) * 3) + hpBonus;
    danoAtaque = 5 + ((nivel - 1) * 2) + danoBonus;
    agilidade = ((nivel - 1) * 0.5) + agilidadeBonus;

    vida = vidaMax;
    macas = macasMax;
    atualizarStatus();

    abrirSelecaoSkins();
}

function fecharModal() {
    tocarSomAcao();
    document.getElementById("modal-overlay").style.display = "none";
    atualizarFocoTeclado("#menu-navegacao .sub-btn");
}

// Inicialização de Status
atualizarStatus();