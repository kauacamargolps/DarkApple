/* =========================================
   DARK APPLES — SALVAMENTO LOCAL
   Até 13 jornadas independentes no navegador.
========================================= */
const CHAVE_SAVES = "darkApples_saves_v1";
let saveAtivoId = null;
let novoSaveEmCriacao = false;

function lerSaves() {
    try {
        const dados = JSON.parse(localStorage.getItem(CHAVE_SAVES) || "[]");
        return Array.isArray(dados) ? dados : [];
    } catch (e) { return []; }
}
function gravarSaves(lista) {
    localStorage.setItem(CHAVE_SAVES, JSON.stringify(lista));
}
function criarIdSave() {
    return "save_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,7);
}
function abrirTelaSaves() {
    // Use direct DOM references so this screen is shown even if another
    // part of the game has left an old screen/state active.
    const inicio = document.getElementById("tela-inicio");
    const selecao = document.getElementById("tela-selecao-personagem");
    const tela = document.getElementById("tela-saves");
    const jogo = document.getElementById("undertale-box");
    if (inicio) inicio.classList.add("oculto");
    if (selecao) selecao.classList.add("oculto");
    if (jogo) jogo.classList.add("oculto");
    if (tela) {
        tela.classList.remove("oculto");
        tela.style.display = "flex";
        tela.style.visibility = "visible";
        tela.style.opacity = "1";
        tela.style.zIndex = "9999";
    }
    if (typeof tocarSomAcao === "function") tocarSomAcao();
    renderizarListaSaves();
}
function voltarDoMenuSaves() {
    const tela = document.getElementById("tela-saves");
    if (tela) { tela.classList.add("oculto"); tela.style.display = ""; }
    telaInicio.classList.remove("oculto");
}
function renderizarListaSaves() {
    const lista = lerSaves();
    const area = $("lista-saves");
    area.innerHTML = "";
    if (!lista.length) {
        area.innerHTML = '<div class="save-vazio">Nenhuma jornada encontrada. Crie seu primeiro save para começar.</div>';
    }
    lista.forEach(save => {
        const card = document.createElement("article");
        card.className = "save-card";
        const personagem = skinsDisponiveis[save.personagem] || skinsDisponiveis.rei;
        card.innerHTML = `
            <h3>${escaparHTML(save.nome || "Jornada sem nome")}</h3>
            <p>PERSONAGEM: ${escaparHTML(personagem.nome)}</p>
            <p>FERAS POUPADAS: ${(save.ferasPoupadas || []).length}</p>
            <p>FERAS DERROTADAS: ${(save.ferasDerrotadas || []).length}</p>
            <p>ALMAS: ${Number(save.almas) || 0} · LV ${Number(save.nivel) || 1}</p>
            <div class="save-acoes">
                <button type="button" data-carregar="${save.id}">CONTINUAR</button>
                <button type="button" class="btn-apagar" data-apagar="${save.id}">APAGAR</button>
            </div>`;
        area.appendChild(card);
    });
    area.querySelectorAll("[data-carregar]").forEach(btn => btn.addEventListener("click", () => carregarSave(btn.dataset.carregar)));
    area.querySelectorAll("[data-apagar]").forEach(btn => btn.addEventListener("click", () => apagarSave(btn.dataset.apagar)));
    const novo = $("btn-novo-save");
    novo.disabled = lista.length >= 13;
    novo.textContent = lista.length >= 13 ? "LIMITE DE 13 — APAGUE UM SAVE" : "＋ NOVO SAVE";
    novo.classList.toggle("save-limite", lista.length >= 13);
}
function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function criarNovoSave() {
    const lista = lerSaves();
    if (lista.length >= 13) {
        alert("Você atingiu o limite de 13 jornadas. Apague um save para criar outro.");
        return;
    }
    const nome = prompt("Qual será o nome desta jornada?", `Jornada ${lista.length + 1}`);
    if (nome === null) return;
    const nomeFinal = nome.trim().slice(0,32);
    if (!nomeFinal) { alert("Digite um nome para o save."); return; }
    saveAtivoId = criarIdSave();
    novoSaveEmCriacao = true;
    lista.push({
        id: saveAtivoId, nome: nomeFinal, personagem: "rei",
        ferasPoupadas: [], ferasDerrotadas: [], almas: 0,
        nivel: 1, almasNecessarias: 30, vida: 20, macas: 5,
        atualizado: new Date().toISOString()
    });
    gravarSaves(lista);
    const tela = document.getElementById("tela-saves");
    if (tela) { tela.classList.add("oculto"); tela.style.display = ""; }
    document.getElementById("tela-selecao-personagem").classList.remove("oculto");
    mostrarSelecaoPersonagem();
}
function apagarSave(id) {
    const lista = lerSaves();
    const save = lista.find(s => s.id === id);
    if (!save || !confirm(`Apagar permanentemente "${save.nome}" deste navegador?`)) return;
    gravarSaves(lista.filter(s => s.id !== id));
    if (saveAtivoId === id) saveAtivoId = null;
    renderizarListaSaves();
}
function carregarSave(id) {
    const save = lerSaves().find(s => s.id === id);
    if (!save) { alert("Este save não foi encontrado."); renderizarListaSaves(); return; }
    saveAtivoId = id;
    nivel = Number(save.nivel) || 1;
    almas = Number(save.almas) || 0;
    almasNecessarias = Number(save.almasNecessarias) || 30;
    skinAtual = skinsDisponiveis[save.personagem] ? save.personagem : "rei";
    animaisCapturados = Array.isArray(save.ferasPoupadas) ? [...save.ferasPoupadas] : [];
    animaisDerrotados = Array.isArray(save.ferasDerrotadas) ? [...save.ferasDerrotadas] : [];
    atualizarStatus();
    vida = Math.min(Number(save.vida) || vidaMax, vidaMax);
    macas = Math.min(Number(save.macas) || macasMax, macasMax);
    jogoIniciado = false;
    $("tela-saves").classList.add("oculto");
    $("tela-selecao-personagem").classList.add("oculto");
    telaInicio.classList.add("oculto");
    iniciarJogo();
}
function concluirNovoSaveComPersonagem() {
    if (!saveAtivoId) return;
    salvarProgressoAtual();
}
function salvarProgressoAtual() {
    if (!saveAtivoId || typeof skinsDisponiveis === "undefined") return;
    const lista = lerSaves();
    const idx = lista.findIndex(s => s.id === saveAtivoId);
    if (idx < 0) return;
    const atual = lista[idx];
    lista[idx] = {
        ...atual,
        personagem: skinAtual,
        ferasPoupadas: [...(animaisCapturados || [])],
        ferasDerrotadas: [...(animaisDerrotados || [])],
        almas, nivel, almasNecessarias, vida, macas,
        atualizado: new Date().toISOString()
    };
    gravarSaves(lista);
}
function salvarSaveManual() {
    if (!saveAtivoId) {
        alert("Nenhuma jornada está selecionada para salvar.");
        return;
    }
    salvarProgressoAtual();
    const botao = document.getElementById("btn-salvar-save");
    if (botao) {
        const textoOriginal = botao.textContent;
        botao.textContent = "✓ SALVO!";
        botao.classList.add("save-confirmado");
        setTimeout(() => {
            botao.textContent = textoOriginal;
            botao.classList.remove("save-confirmado");
        }, 1400);
    }
}
window.addEventListener("beforeunload", salvarProgressoAtual);
