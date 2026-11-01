/* =========================================
   DARK APPLES — BASE DO JOGO
========================================= */


/* =========================================
   ÁUDIO
========================================= */

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarSomBeep(freq = 440, duracao = 0.06, tipo = "square") {
    try {
        if (audioCtx.state === "suspended") audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = tipo;
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioCtx.currentTime + duracao
        );

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duracao);

    } catch (erro) {
        console.warn("Áudio indisponível:", erro);
    }
}

function tocarSomAcao() {
    tocarSomBeep(600, 0.07, "square");
}

function tocarSomDano() {
    tocarSomBeep(130, 0.2, "sawtooth");
}

function tocarSomLevelUp() {
    [261, 329, 392, 523, 659].forEach((nota, i) => {
        setTimeout(() => {
            tocarSomBeep(nota, 0.12, "triangle");
        }, i * 100);
    });
}


/* =========================================
   ESTADO DO JOGO
========================================= */

let jogoIniciado = false;

let nivel = 1;
let almas = 0;
let almasNecessarias = 30;

let vidaMax = 20;
let vida = 20;

let danoAtaque = 5;
let agilidade = 0;

let macasMax = 5;
let macas = 5;

let animaisCapturados = [];
let animaisDerrotados = [];
let animalAtual = null;

let emCombate = false;
let emFaseDesvio = false;
let bloqueado = false;

let intervaloTexto = null;
let timeoutTexto = null;

let botoesAtivos = [];
let indiceFocado = 0;

let misericordia = 0;

/*
   Trava para impedir múltiplas ações
   durante o mesmo turno.
*/

let ataqueEmAndamento = false;


/* =========================================
   SKINS E HABILIDADES
========================================= */

const skinsDisponiveis = {

    rei: {
        nome: "Soberano Fenrir",
        imgSrc: "assets/img/heroi_rei.png",
        descricao: "+5 HP máximo",
        hp: 5,
        dano: 0,
        velocidade: 0,
        macas: 0
    },

    rainha: {
        nome: "Rainha Fenrys",
        imgSrc: "assets/img/heroi_rainha.png",
        descricao: "+8 HP máximo",
        hp: 8,
        dano: 0,
        velocidade: 0,
        macas: 0
    },

    cavaleiro: {
        nome: "Cavaleiro Imperial",
        imgSrc: "assets/img/heroi_cavaleiro.png",
        descricao: "+10 HP máximo",
        hp: 10,
        dano: 0,
        velocidade: 0,
        macas: 0
    },

    arqueiro: {
        nome: "Arqueiro das Sombras",
        imgSrc: "assets/img/heroi_arqueiro.png",
        descricao: "+2 agilidade",
        hp: 0,
        dano: 0,
        velocidade: 2,
        macas: 0
    },

    mago: {
        nome: "Mago Arcano",
        imgSrc: "assets/img/heroi_mago.png",
        descricao: "+3 de dano",
        hp: 0,
        dano: 3,
        velocidade: 0,
        macas: 0
    },

    domador: {
        nome: "Domador de Feras",
        imgSrc: "assets/img/heroi_domador.png",
        descricao: "+3 maçãs máximas",
        hp: 0,
        dano: 0,
        velocidade: 0,
        macas: 3
    }

};

let skinAtual = "rei";


function obterBonusSkin() {
    return skinsDisponiveis[skinAtual];
}


function equiparSkin(chave) {

    if (!skinsDisponiveis[chave]) return;

    skinAtual = chave;

    tocarSomAcao();

    atualizarStatus();

    abrirSelecaoSkins();

}


/* =========================================
   ELEMENTOS HTML
========================================= */

const $ = id => document.getElementById(id);

const telaInicio = $("tela-inicio");
const telaMorte = $("tela-morte");
const jogoBox = $("undertale-box");

const caixaTexto = $("caixa-texto");
const narrativaTexto = $("narrativa-texto");

const menuInterativo = $("menu-interativo");
const botoesCombate = $("botoes-principais");
const menuNavegacao = $("menu-navegacao");

const arenaBox = $("arena-box");
const canvasArena = $("canvasArena");
const ctxArena = canvasArena.getContext("2d");