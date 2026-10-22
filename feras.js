/* =========================================
   LISTA DE FERAS / MONSTROS DO JOGO (COM HP E CHANCE DE PIEDADE)
========================================= */
const inimigos = [

    // =========================================
    // NÍVEL 1 — AMEAÇAS COMUNS
    // =========================================

    {
        nome: "Pombo da Podridão",
        hp: 15,
        hpMax: 15,
        dano: 3,
        almas: 10,
        velocidade: 4.5,
        quantidade: 5,
        tempoLuta: 5.0,
        imgSrc: "assets/img/animais/pombo.png",
        fala: "Pruuu... Podridão na alma!",
        chancePiedade: 30,
        acaoCerta: "Pacificação",
        dicaAcao: "Oferecer migalhas de luz ou pacificá-lo acalma a podridão."
    },

    {
        nome: "Capivara do Abismo",
        hp: 20,
        hpMax: 20,
        dano: 5,
        almas: 15,
        velocidade: 5.0,
        quantidade: 6,
        tempoLuta: 6.0,
        imgSrc: "assets/img/animais/capivara.png",
        fala: "A paz do abismo é tranquila.",
        chancePiedade: 30,
        acaoCerta: "Acariciar",
        dicaAcao: "Apenas precisa de afeto e presença tranquila."
    },

    {
        nome: "Cervo Espectral",
        hp: 22,
        hpMax: 22,
        dano: 6,
        almas: 20,
        velocidade: 5.2,
        quantidade: 6,
        tempoLuta: 6.5,
        imgSrc: "assets/img/animais/cervo.png",
        fala: "Os ventos da floresta guardam segredos...",
        chancePiedade: 25,
        acaoCerta: "Pacificação",
        dicaAcao: "Demonstre serenidade para acalmar seu espírito errante."
    },


    // =========================================
    // NÍVEL 2 — AMEAÇAS PERIGOSAS
    // =========================================

    {
        nome: "Lobo das Cinzas",
        hp: 30,
        hpMax: 30,
        dano: 8,
        almas: 30,
        velocidade: 5.6,
        quantidade: 7,
        tempoLuta: 7.0,
        imgSrc: "assets/img/animais/lobo.png",
        fala: "Au... As cinzas queimam!",
        chancePiedade: 20,
        acaoCerta: "Intimidação",
        dicaAcao: "Mostre que sua DETERMINAÇÃO é maior que o fogo dele."
    },

    {
        nome: "Praga Encarnada",
        hp: 32,
        hpMax: 32,
        dano: 8,
        almas: 30,
        velocidade: 5.8,
        quantidade: 7,
        tempoLuta: 7.0,
        imgSrc: "assets/img/animais/praga.png",
        fala: "A doença consome tudo ao redor.",
        chancePiedade: 20,
        acaoCerta: "Pacificação",
        dicaAcao: "Purifique o ambiente com calmaria para enfraquecer o contágio."
    },

    {
        nome: "Lagosta Infernal",
        hp: 35,
        hpMax: 35,
        dano: 10,
        almas: 40,
        velocidade: 6.0,
        quantidade: 8,
        tempoLuta: 7.5,
        imgSrc: "assets/img/animais/lagosta.png",
        fala: "O calor das profundezas ferve em minhas pinças!",
        chancePiedade: 20,
        acaoCerta: "Intimidação",
        dicaAcao: "Encare sua carapaça rígida com firmeza e força."
    },

    {
        nome: "Viúva Sombria",
        hp: 38,
        hpMax: 38,
        dano: 11,
        almas: 45,
        velocidade: 6.4,
        quantidade: 8,
        tempoLuta: 8.0,
        imgSrc: "assets/img/animais/viuva.png",
        fala: "Venha tricotar a sua própria perdição na teia.",
        chancePiedade: 15,
        acaoCerta: "Acariciar",
        dicaAcao: "Um toque inesperado e cuidadoso quebra sua desconfiança venenosa."
    },


    // =========================================
    // NÍVEL 3 — AMEAÇAS ELITE
    // =========================================

    {
        nome: "Morcego do Vazio",
        hp: 45,
        hpMax: 45,
        dano: 13,
        almas: 55,
        velocidade: 6.8,
        quantidade: 8,
        tempoLuta: 8.5,
        imgSrc: "assets/img/animais/morcego.png",
        fala: "A escuridão é o meu único império.",
        chancePiedade: 15,
        acaoCerta: "Pacificação",
        dicaAcao: "Mostre que a luz não precisa ser agressiva para guiar o caminho."
    },

    {
        nome: "Escorpião do Caos",
        hp: 50,
        hpMax: 50,
        dano: 14,
        almas: 65,
        velocidade: 7.2,
        quantidade: 9,
        tempoLuta: 9.0,
        imgSrc: "assets/img/animais/escorpiao.png",
        fala: "O ferrão do caos é implacável e certeiro.",
        chancePiedade: 15,
        acaoCerta: "Intimidação",
        dicaAcao: "Demonstre coragem perante o perigo iminente do seu ferrão."
    },

    {
        nome: "Urso Pardo Corrompido",
        hp: 60,
        hpMax: 60,
        dano: 16,
        almas: 75,
        velocidade: 7.5,
        quantidade: 9,
        tempoLuta: 9.5,
        imgSrc: "assets/img/animais/urso.png",
        fala: "ROAARRR! DETERMINAÇÃO!",
        chancePiedade: 10,
        acaoCerta: "Acalmar",
        dicaAcao: "O desespero o corrompeu. Acalme sua fúria."
    },

    {
        nome: "Serpente do Eclipse",
        hp: 65,
        hpMax: 65,
        dano: 17,
        almas: 85,
        velocidade: 7.8,
        quantidade: 9,
        tempoLuta: 10.0,
        imgSrc: "assets/img/animais/serpente.png",
        fala: "Sssss... A lua engoliu o sol.",
        chancePiedade: 10,
        acaoCerta: "Pacificação",
        dicaAcao: "Conduza o seu olhar de forma pacífica para desarmar o seu bote."
    },


    // =========================================
    // NÍVEL 4 — AMEAÇAS LENDÁRIAS
    // =========================================

    {
        nome: "Crocodilo Profano",
        hp: 80,
        hpMax: 80,
        dano: 20,
        almas: 110,
        velocidade: 8.4,
        quantidade: 10,
        tempoLuta: 11.0,
        imgSrc: "assets/img/animais/crocodilo.png",
        fala: "As águas turvas guardam monstros ancestrais.",
        chancePiedade: 10,
        acaoCerta: "Intimidação",
        dicaAcao: "Enfrente a sua mandíbula pesada com uma postura inabalável."
    },

    {
        nome: "Polvo do Abismo",
        hp: 100,
        hpMax: 100,
        dano: 24,
        almas: 140,
        velocidade: 9.0,
        quantidade: 10,
        tempoLuta: 12.0,
        imgSrc: "assets/img/animais/polvo.png",
        fala: "Tentáculos vindos direto das fossas mais profundas!",
        chancePiedade: 5,
        acaoCerta: "Pacificação",
        dicaAcao: "Traga calmaria às águas revoltas geradas pelos seus tentáculos."
    }

];