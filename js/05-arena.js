/* =========================================
   DARK APPLES — ARENA DE ESQUIVA
   Os padrões são diferentes para cada fera.
   A dificuldade também acompanha o nível do jogador.
========================================= */

let coracao = { x: 250, y: 110, tamanho: 13, velocidade: 3.5 };
let projeteis = [];
let teclas = {};
let animacaoArena = null;
let tempoArena = 0;
let ultimoDisparo = 0;
let imagemPersonagemArena = null;
let quadroInvulneravel = 0;
let padraoAnterior = -1;

// Carrega a imagem da skin escolhida para usá-la como personagem na arena.
function carregarImagemPersonagemArena() {
    const skin = skinsDisponiveis[skinAtual];
    if (!skin) return;

    imagemPersonagemArena = new Image();
    imagemPersonagemArena.src = skin.imgSrc;
}

function iniciarArena() {
    coracao.x = canvasArena.width / 2;
    coracao.y = canvasArena.height / 2;
    projeteis = [];
    tempoArena = 0;
    ultimoDisparo = 0;
    quadroInvulneravel = 0;
    padraoAnterior = -1;
    teclas = {};

    const bonus = obterBonusSkin();
    coracao.velocidade = 3.5 + bonus.velocidade + Math.min(1.5, (nivel - 1) * 0.08);
    carregarImagemPersonagemArena();

    cancelarArena();
    animacaoArena = requestAnimationFrame(loopArena);
}

function cancelarArena() {
    if (animacaoArena) {
        cancelAnimationFrame(animacaoArena);
        animacaoArena = null;
    }
}

// Calcula o quanto a batalha fica mais difícil conforme o LV do jogador.
function multiplicadorDificuldade() {
    return 1 + Math.min(1.25, Math.max(0, nivel - 1) * 0.10);
}

// Cria um projétil com velocidade, tamanho e cor próprios.
function adicionarProjetil(x, y, angulo, velocidade, cor = '#f4d8ff', tamanho = 5) {
    projeteis.push({
        x, y,
        vx: Math.cos(angulo) * velocidade,
        vy: Math.sin(angulo) * velocidade,
        tamanho,
        cor,
        brilho: 0
    });
}

// Mira diretamente no personagem. Usado por feras que perseguem o jogador.
function disparoMirado(origemX, origemY, velocidade, desvio = 0) {
    const angulo = Math.atan2(coracao.y - origemY, coracao.x - origemX) + desvio;
    adicionarProjetil(origemX, origemY, angulo, velocidade, '#ffb0d8', 5);
}

function nomeDaFera() {
    return (animalAtual?.nome || '').toLowerCase();
}

/*
 * Cada espécie tem uma assinatura visual:
 * pombo = leque de penas; capivara = anel lento;
 * lobo = rajada mirada; cervo/serpente = espiral;
 * aranhas = teia; lagosta/crocodilo = varredura;
 * morcego = mergulho; escorpião = ferrão;
 * urso/bisão = ondas pesadas; polvo = tentáculos radiais.
 */
// Retorna um ponto na borda para que nenhum projétil nasça em cima do jogador.
function pontoNaBorda(angulo, margem = 12) {
    const w = canvasArena.width, h = canvasArena.height;
    const cx = w / 2, cy = h / 2;
    const dx = Math.cos(angulo), dy = Math.sin(angulo);
    const tx = Math.abs(dx) < 0.001 ? Infinity : (w / 2 - margem) / Math.abs(dx);
    const ty = Math.abs(dy) < 0.001 ? Infinity : (h / 2 - margem) / Math.abs(dy);
    const t = Math.min(tx, ty);
    return { x: cx + dx * t, y: cy + dy * t };
}

// Dispara da borda em direção ao interior, mantendo uma janela de reação.
function disparoDaBorda(angulo, velocidade, cor, tamanho = 5) {
    const ponto = pontoNaBorda(angulo);
    adicionarProjetil(ponto.x, ponto.y, angulo + Math.PI, velocidade, cor, tamanho);
}

// Cada fera mantém sua identidade por cor, mas os ataques são sorteados
// entre padrões diferentes. Todos podem nascer em qualquer lado, inclusive diagonais.
function corDaFera() {
    const nome = nomeDaFera();
    if (nome.includes('crocodilo')) return '#65e6a6';
    if (nome.includes('lagosta')) return '#ff9b68';
    if (nome.includes('lobo')) return '#ff8fbd';
    if (nome.includes('pombo')) return '#d5c4ff';
    if (nome.includes('capivara')) return '#8de7cf';
    if (nome.includes('escorpiao') || nome.includes('escorpião')) return '#f6cf72';
    if (nome.includes('morcego')) return '#a99aff';
    if (nome.includes('polvo')) return '#8fdcff';
    if (nome.includes('urso') || nome.includes('bisao') || nome.includes('bisão')) return '#ff879b';
    if (nome.includes('serpente')) return '#b6e879';
    if (nome.includes('cervo')) return '#e8c78b';
    if (nome.includes('viuva') || nome.includes('viúva') || nome.includes('praga')) return '#d79cff';
    return '#c5a6ff';
}

function pontoAleatorioNaBorda(margem = 14) {
    const w = canvasArena.width, h = canvasArena.height;
    const lado = Math.floor(Math.random() * 4);
    if (lado === 0) return { x: Math.random() * w, y: -margem };
    if (lado === 1) return { x: w + margem, y: Math.random() * h };
    if (lado === 2) return { x: Math.random() * w, y: h + margem };
    return { x: -margem, y: Math.random() * h };
}

function disparoAteCentro(x, y, velocidade, cor, desvio = 0, tamanho = 5) {
    const angulo = Math.atan2(coracao.y - y, coracao.x - x) + desvio;
    adicionarProjetil(x, y, angulo, velocidade, cor, tamanho);
}

function criarProjetil() {
    const cor = corDaFera();
    const escalaNivel = 1 + Math.min(0.22, Math.max(0, nivel - 1) * 0.018);
    const velocidade = Math.min(4.5, (animalAtual?.velocidade || 4.5) * 0.31) * escalaNivel;
    const w = canvasArena.width, h = canvasArena.height;
    const cx = w / 2, cy = h / 2;

    // Evita repetir o mesmo padrão em duas ondas consecutivas.
    const padroes = ['rajada', 'anel', 'diagonais', 'espiral', 'chuva', 'leque', 'cruz', 'perseguicao'];
    let indice = Math.floor(Math.random() * padroes.length);
    if (indice === padraoAnterior) indice = (indice + 1 + Math.floor(Math.random() * (padroes.length - 1))) % padroes.length;
    padraoAnterior = indice;

    switch (padroes[indice]) {
        case 'rajada': {
            // Rajada de três ou quatro projéteis disparados de uma borda aleatória.
            const origem = pontoAleatorioNaBorda();
            const base = Math.atan2(cy - origem.y, cx - origem.x);
            const quantidade = 3 + Math.floor(Math.random() * 2);
            for (let i = 0; i < quantidade; i++) {
                const desvio = (i - (quantidade - 1) / 2) * 0.16;
                adicionarProjetil(origem.x, origem.y, base + desvio, velocidade * 0.9, cor, 5);
            }
            break;
        }
        case 'anel': {
            // Círculo com uma abertura segura que muda de posição.
            const quantidade = 9;
            const abertura = Math.floor(Math.random() * quantidade);
            const giro = Math.random() * Math.PI * 2;
            for (let i = 0; i < quantidade; i++) {
                if (i === abertura) continue;
                const angulo = giro + i * Math.PI * 2 / quantidade;
                const ponto = pontoNaBorda(angulo);
                adicionarProjetil(ponto.x, ponto.y, angulo + Math.PI, velocidade * 0.58, cor, 5);
            }
            break;
        }
        case 'diagonais': {
            // Disparos que cruzam a arena pelas quatro diagonais.
            const entradas = [
                [-14, -14, 1, 1], [w + 14, -14, -1, 1],
                [-14, h + 14, 1, -1], [w + 14, h + 14, -1, -1]
            ];
            entradas.forEach(([x, y]) => disparoAteCentro(x, y, velocidade * 0.82, cor, (Math.random() - .5) * .12));
            break;
        }
        case 'espiral': {
            const giro = Math.random() * Math.PI * 2;
            for (let i = 0; i < 7; i++) {
                const angulo = giro + i * Math.PI * 2 / 7;
                const ponto = pontoNaBorda(angulo);
                adicionarProjetil(ponto.x, ponto.y, angulo + Math.PI, velocidade * 0.62, cor, 4);
            }
            break;
        }
        case 'chuva': {
            // Alterna entre chuva vertical e horizontal.
            const horizontal = Math.random() < .5;
            const sentido = Math.random() < .5 ? -1 : 1;
            for (let i = 0; i < 6; i++) {
                if (horizontal) {
                    const x = sentido < 0 ? -12 : w + 12;
                    const y = 35 + i * (h - 70) / 5;
                    adicionarProjetil(x, y, sentido < 0 ? 0 : Math.PI, velocidade * 0.72, cor, 4);
                } else {
                    const x = 35 + i * (w - 70) / 5;
                    const y = sentido < 0 ? -12 : h + 12;
                    adicionarProjetil(x, y, sentido < 0 ? Math.PI / 2 : -Math.PI / 2, velocidade * 0.72, cor, 4);
                }
            }
            break;
        }
        case 'leque': {
            const origem = pontoAleatorioNaBorda();
            const base = Math.atan2(cy - origem.y, cx - origem.x);
            for (let i = -3; i <= 3; i++) {
                adicionarProjetil(origem.x, origem.y, base + i * 0.13, velocidade * 0.76, cor, 4);
            }
            break;
        }
        case 'cruz': {
            const giro = Math.random() * Math.PI / 4;
            for (let i = 0; i < 8; i++) {
                const angulo = giro + i * Math.PI / 4;
                const ponto = pontoNaBorda(angulo);
                adicionarProjetil(ponto.x, ponto.y, angulo + Math.PI, velocidade * 0.67, cor, 5);
            }
            break;
        }
        case 'perseguicao': {
            // Dois disparos mirados com pequena diferença, para não serem idênticos.
            for (let i = 0; i < 2; i++) {
                const origem = pontoAleatorioNaBorda();
                disparoAteCentro(origem.x, origem.y, velocidade * 0.88, cor, (Math.random() - .5) * 0.22, 5);
            }
            break;
        }
    }
}

// Desenha a skin selecionada no lugar do coração clássico.
function desenharPersonagem(x, y) {
    if (imagemPersonagemArena?.complete && imagemPersonagemArena.naturalWidth > 0) {
        const tamanho = 42;
        // Um brilho discreto destaca o personagem sem esconder o cenário.
        ctxArena.save();
        ctxArena.shadowColor = '#b78cff';
        ctxArena.shadowBlur = 13;
        ctxArena.globalAlpha = quadroInvulneravel > 0 && Math.floor(quadroInvulneravel / 4) % 2 === 0 ? .35 : 1;
        ctxArena.drawImage(imagemPersonagemArena, x - tamanho / 2, y - tamanho / 2, tamanho, tamanho);
        ctxArena.restore();
    } else {
        // Fallback caso a imagem ainda não tenha carregado.
        ctxArena.fillStyle = '#ff4d8d';
        ctxArena.beginPath();
        ctxArena.arc(x, y, 8, 0, Math.PI * 2);
        ctxArena.fill();
    }
}

function desenharFundoArena(largura, altura) {
    // Grade sutil e pontos de luz dão profundidade à arena.
    ctxArena.fillStyle = '#090817';
    ctxArena.fillRect(0, 0, largura, altura);
    ctxArena.strokeStyle = 'rgba(160, 130, 255, .09)';
    ctxArena.lineWidth = 1;
    for (let x = 20; x < largura; x += 25) {
        ctxArena.beginPath(); ctxArena.moveTo(x, 0); ctxArena.lineTo(x, altura); ctxArena.stroke();
    }
    for (let y = 20; y < altura; y += 25) {
        ctxArena.beginPath(); ctxArena.moveTo(0, y); ctxArena.lineTo(largura, y); ctxArena.stroke();
    }
    const brilho = ctxArena.createRadialGradient(largura / 2, altura / 2, 8, largura / 2, altura / 2, largura * .7);
    brilho.addColorStop(0, 'rgba(93, 56, 145, .16)');
    brilho.addColorStop(1, 'rgba(4, 3, 12, .35)');
    ctxArena.fillStyle = brilho;
    ctxArena.fillRect(0, 0, largura, altura);
}

function loopArena() {
    if (!emFaseDesvio) return;
    const largura = canvasArena.width;
    const altura = canvasArena.height;
    desenharFundoArena(largura, altura);
    tempoArena++;

    // Movimento com suporte a setas e WASD.
    if (teclas.ArrowLeft || teclas.a) coracao.x -= coracao.velocidade;
    if (teclas.ArrowRight || teclas.d) coracao.x += coracao.velocidade;
    if (teclas.ArrowUp || teclas.w) coracao.y -= coracao.velocidade;
    if (teclas.ArrowDown || teclas.s) coracao.y += coracao.velocidade;

    coracao.x = Math.max(19, Math.min(largura - 19, coracao.x));
    coracao.y = Math.max(19, Math.min(altura - 19, coracao.y));

    // Em níveis maiores, os disparos acontecem com intervalos menores.
    const intervaloDisparo = Math.max(82, 118 - Math.min(18, (nivel - 1) * 1.1));
    if (tempoArena - ultimoDisparo >= intervaloDisparo) {
        criarProjetil();
        ultimoDisparo = tempoArena;
    }

    for (let i = projeteis.length - 1; i >= 0; i--) {
        const p = projeteis[i];
        p.x += p.vx;
        p.y += p.vy;

        const distancia = Math.hypot(p.x - coracao.x, p.y - coracao.y);
        if (distancia < p.tamanho + 10 && quadroInvulneravel <= 0) {
            projeteis.splice(i, 1);
            quadroInvulneravel = 48; // breve proteção para evitar dano em sequência instantânea
            const danoBase = Math.max(2, Math.min(7, Math.round((animalAtual?.dano || 3) * 0.35)));
            const dano = danoBase; // O dano já foi escalado quando a fera apareceu.
            vida = Math.max(0, vida - dano);
            atualizarStatus();
            tocarSomDano();
            if (vida <= 0) { encerrarArena(false); return; }
            continue;
        }

        // Partículas com cor específica para cada tipo de ataque.
        ctxArena.save();
        ctxArena.shadowColor = p.cor;
        ctxArena.shadowBlur = 12;
        ctxArena.fillStyle = p.cor;
        ctxArena.beginPath();
        ctxArena.arc(p.x, p.y, p.tamanho, 0, Math.PI * 2);
        ctxArena.fill();
        ctxArena.restore();

        if (p.x < -30 || p.x > largura + 30 || p.y < -30 || p.y > altura + 30) {
            projeteis.splice(i, 1);
        }
    }

    if (quadroInvulneravel > 0) quadroInvulneravel--;
    desenharPersonagem(coracao.x, coracao.y);

    // A duração aumenta um pouco nos níveis altos para exigir mais atenção.
    const duracaoAtaque = Math.min(1450, 1050 + (nivel - 1) * 15);
    if (tempoArena >= duracaoAtaque) { encerrarArena(true); return; }
    animacaoArena = requestAnimationFrame(loopArena);
}

function encerrarArena(sobreviveu) {
    cancelarArena();
    emFaseDesvio = false;
    teclas = {};
    arenaBox.style.display = 'none';
    $("display-principal").classList.remove("modo-arena");
    caixaTexto.style.display = 'block';
    if (!sobreviveu) { mostrarTelaMorte(); return; }
    escreverTexto('* Você conseguiu desviar dos ataques!\n* É sua vez de agir.', () => {
        setTimeout(() => restaurarTurno(), 700);
    });
}

// Controles de teclado da arena e dos menus.
window.addEventListener('keydown', evento => {
    const tecla = evento.key;
    if (emFaseDesvio) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(tecla)) evento.preventDefault();
        teclas[tecla] = true;
        teclas[tecla.toLowerCase()] = true;
        return;
    }

    if (!jogoIniciado) {
        const telaSelecao = $('tela-selecao-personagem');
        const selecaoAberta = telaSelecao && !telaSelecao.classList.contains('oculto');
        if (selecaoAberta) {
            const cards = Array.from(document.querySelectorAll('#personagens-iniciais .card-skin'));
            if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(tecla)) {
                evento.preventDefault();
                const direcao = (tecla === 'ArrowRight' || tecla === 'ArrowDown') ? 1 : -1;
                indiceFocado = (indiceFocado + direcao + cards.length) % cards.length;
                cards.forEach(card => card.classList.remove('focado'));
                const card = cards[indiceFocado];
                if (card) { card.classList.add('focado'); card.click(); } 
            } else if (tecla === 'Enter' || tecla === ' ') {
                evento.preventDefault();
                const confirmar = $('btn-confirmar-personagem');
                if (confirmar && !confirmar.disabled) confirmarPersonagemEIniciar();
                else if (cards[indiceFocado]) cards[indiceFocado].click();
            } else if (tecla === 'Escape') {
                evento.preventDefault();
                voltarTelaInicio();
            }
        } else if (tecla === 'Enter' || tecla === ' ') {
            evento.preventDefault();
            mostrarSelecaoPersonagem();
        }
        return;
    }

    if (telaMorte.classList.contains('oculto') === false) {
        if (tecla === 'Enter' || tecla === ' ') reiniciarJogoCompleto();
        return;
    }

    if (tecla === 'ArrowRight' || tecla === 'ArrowDown') { evento.preventDefault(); manterFoco(1); }
    if (tecla === 'ArrowLeft' || tecla === 'ArrowUp') { evento.preventDefault(); manterFoco(-1); }
    if (tecla === 'Enter' || tecla === ' ') {
        evento.preventDefault();
        if (botoesAtivos[indiceFocado]) botoesAtivos[indiceFocado].click();
    }
    if (tecla === 'Escape' || tecla.toLowerCase() === 'x') {
        if (emCombate && !bloqueado) restaurarTurno();
        else if (!$('modal-overlay').classList.contains('oculto')) fecharModal();
    }
});

window.addEventListener('keyup', evento => {
    teclas[evento.key] = false;
    teclas[evento.key.toLowerCase()] = false;
});
window.addEventListener('blur', () => { teclas = {}; });
