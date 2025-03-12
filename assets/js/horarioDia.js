/***********************************
 * Navegação de voltar para Home
 ***********************************/
function voltarHome() {
  window.location.href = "index.html";
}

/***********************************
 * Formatação de valores numéricos (2 dígitos)
 ***********************************/
function formatarNumero(num) {
  return num < 10 ? `0${num}` : num;
}

/***********************************
 * Atualiza o relógio em tempo real
 ***********************************/
function atualizarRelogio() {
  const agora = new Date();
  const horas = formatarNumero(agora.getHours());
  const minutos = formatarNumero(agora.getMinutes());
  const segundos = formatarNumero(agora.getSeconds());
  document.getElementById("relogio").textContent = `${horas}:${minutos}:${segundos}`;
}

/***********************************
 * Exibe data atual (dd/mm/yyyy)
 ***********************************/
function exibirDataAtual() {
  const hoje = new Date();
  const dia = formatarNumero(hoje.getDate());
  const mes = formatarNumero(hoje.getMonth() + 1);
  const ano = hoje.getFullYear();
  document.getElementById("data-atual").textContent = `${dia}/${mes}/${ano}`;
}

/***********************************
 * Retorna data atual em formato yyyy-mm-dd
 ***********************************/
function getDataISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = formatarNumero(hoje.getMonth() + 1);
  const dia = formatarNumero(hoje.getDate());
  return `${ano}-${mes}-${dia}`;
}

/***********************************
 * Formata "HH:MM" a partir de minutos totais
 ***********************************/
function formatarHorario(totalMinutos) {
  const h = Math.floor(totalMinutos / 60);
  const m = totalMinutos % 60;
  return `${formatarNumero(h)}:${formatarNumero(m)}`;
}

/***********************************
 * Carrega dados do dia (aulas + feriados) e exibe informações
 ***********************************/
async function carregarAulaDoDia() {
  try {
    // Carrega "aulas.json" e "feriados.json" em paralelo
    const [aulas, feriadosData] = await Promise.all([
      fetch("data/aulas.json").then(r => r.json()),
      fetch("data/feriados.json").then(r => r.json())
    ]);

    // Extrai excecoes de feriados (objeto de datas)
    const excecoes = feriadosData.excecoes || {};

    // Elementos do DOM
    const infoAulaEl = document.getElementById("info-aula");
    const tempoPassadoEl = document.getElementById("tempo-passado");

    // Limpa conteúdo anterior
    infoAulaEl.innerHTML = "";
    tempoPassadoEl.innerHTML = "";

    // Verifica se é mês de Férias (janeiro, julho, dezembro)
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1; // 1=jan, 7=jul, 12=dez
    if ([1, 7, 12].includes(mesAtual)) {
      // Exibir mensagem "Férias"
      infoAulaEl.className = "info-aula info-aula--ferias";
      infoAulaEl.innerHTML = `
        <h2 style="margin-bottom: 1rem;">
          <i class="fas fa-suitcase-rolling"></i> Férias
        </h2>
        <p style="margin: 0.6rem 0;">
          Não há aulas neste período de férias.
        </p>
      `;
      return;
    }

    // Se não for mês de férias, checa se hoje é feriado (ou exceção)
    const hojeISO = getDataISO();
    if (excecoes[hojeISO]) {
      const { status, observacoes } = excecoes[hojeISO];
      infoAulaEl.className = "info-aula";

      if (status === "feriado") {
        infoAulaEl.classList.add("info-aula--feriado");
        infoAulaEl.innerHTML = `
          <h2 style="margin-bottom: 1rem;">
            <i class="fas fa-umbrella-beach"></i> Feriado
          </h2>
          <p style="margin: 0.6rem 0;">
            ${observacoes || "Hoje não haverá aula devido a feriado."}
          </p>
        `;
        return;
      }
      // Se quiser tratar "cancelada" via feriados.json, poderia fazer else if (status==="cancelada")...
    }

    // Define o dia da semana
    const diaSemana = hoje.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
    let chaveDia = "";
    switch (diaSemana) {
      case 1: chaveDia = "segunda";  break;
      case 2: chaveDia = "terca";    break;
      case 3: chaveDia = "quarta";   break;
      case 4: chaveDia = "quinta";   break;
      case 5: chaveDia = "sexta";    break;
      default: chaveDia = ""; // Fim de semana
    }

    // Se for sábado, domingo ou não estiver mapeado
    if (!chaveDia || !aulas[chaveDia]) {
      infoAulaEl.innerHTML = `
        <h2 style="margin-bottom: 1rem;">Hoje não há aulas.</h2>
      `;
      return;
    }

    // Recupera os dados de hoje (pode ser um array ou um objeto único)
    let diaData = aulas[chaveDia];
    if (!Array.isArray(diaData)) {
      diaData = [diaData]; // transforma em array para iterar
    }

    // Verifica se TODAS as aulas do dia têm o mesmo status especial
    const todosCancelados = diaData.every(a => a.status === "cancelada");
    const todosOnline = diaData.every(a => a.status === "online");

    // Ajusta a classe base do container
    infoAulaEl.className = "info-aula";
    if (todosCancelados) {
      infoAulaEl.classList.add("info-aula--cancelada");
    } else if (todosOnline) {
      infoAulaEl.classList.add("info-aula--online");
    } else {
      infoAulaEl.classList.add("info-aula--normal");
    }

    // Título principal do card
    let htmlAulas = `
      <h2 style="margin-bottom: 1rem;">
        <i class="fas fa-book"></i> Aulas de Hoje
      </h2>
    `;

    // Se for segunda-feira e houver mais de uma aula, destaque essa informação
    if (chaveDia === "segunda" && diaData.length > 1) {
      htmlAulas += `
        <p style="font-weight: bold; margin: 0 0 1rem 0; color: #333;">
          Hoje temos duas aulas diferentes! Fique atento(a) aos horários.
        </p>
      `;
    }

    // Para exibir "quando começa/termina" de forma global,
    // pegamos o menor horário de início e o maior de término
    let minStartInMinutes = Infinity;
    let maxEndInMinutes = -Infinity;

    // Montamos cada aula dentro do mesmo card, separando com <hr> se houver mais de uma
    diaData.forEach((aula, index) => {
      const {
        disciplina,
        professor,
        sala,
        inicio,
        termino,
        status = "normal",
        observacoes = "",
        linkOnline = ""
      } = aula;

      // Converte horários para minutos totais
      const [startHour, startMin] = inicio.split(":").map(Number);
      const [endHour, endMin] = termino.split(":").map(Number);
      const startInMinutes = startHour * 60 + startMin;
      const endInMinutes = endHour * 60 + endMin;

      if (startInMinutes < minStartInMinutes) minStartInMinutes = startInMinutes;
      if (endInMinutes > maxEndInMinutes) maxEndInMinutes = endInMinutes;

      // Se não for a primeira aula, insere um <hr> para separar
      if (index > 0) {
        htmlAulas += `
          <hr style="margin: 1.2rem 0; border: none; border-top: 1px solid #ccc;" />
        `;
      }

      // Título ou mini-título da aula, com a contagem "Aula 1", "Aula 2", etc.
      htmlAulas += `
        <h3 style="margin: 0 0 0.7rem 0; font-size: 1.05rem;">
          Aula ${index + 1}: ${disciplina}
        </h3>
      `;

      // Professor, Horário, Sala
      htmlAulas += `
        <p style="margin: 0.4rem 0;">
          <strong>Professor(a):</strong> ${professor}
        </p>
        <p style="margin: 0.4rem 0;">
          <strong>Horário:</strong> ${inicio} - ${termino}
        </p>
      `;

      // Se for online, pode mostrar link; se não, mostra sala
      if (status === "online") {
        if (linkOnline) {
          htmlAulas += `
            <p style="margin: 0.4rem 0;">
              <strong>Link:</strong> 
              <a href="${linkOnline}" target="_blank">${linkOnline}</a>
            </p>
          `;
        }
      } else {
        htmlAulas += `
          <p style="margin: 0.4rem 0;">
            <strong>Sala:</strong> ${sala || "—"}
          </p>
        `;
      }

      // Observações extras
      if (observacoes) {
        htmlAulas += `
          <p style="margin: 0.4rem 0;">
            ${observacoes}
          </p>
        `;
      }
    });

    // Insere no container principal
    infoAulaEl.innerHTML = htmlAulas;

    // Agora, definimos a frase de tempo (apenas uma vez, no final do card)
    const horaAtual = hoje.getHours();
    const minutoAtual = hoje.getMinutes();
    const currentInMinutes = horaAtual * 60 + minutoAtual;

    if (currentInMinutes < minStartInMinutes) {
      tempoPassadoEl.innerHTML = `
        <p style="margin: 1rem 0; text-align: center;">
          A aula de hoje começará às ${formatarHorario(minStartInMinutes)}.
        </p>
      `;
    } else if (currentInMinutes >= maxEndInMinutes) {
      tempoPassadoEl.innerHTML = `
        <p style="margin: 1rem 0; text-align: center;">
          A aula de hoje acabou às ${formatarHorario(maxEndInMinutes)}.
        </p>
      `;
    } else {
      tempoPassadoEl.innerHTML = `
        <p style="margin: 1rem 0; text-align: center;">
          As aulas de hoje estão em andamento.
        </p>
      `;
    }

  } catch (erro) {
    console.error("Erro ao carregar JSON:", erro);
  }
}

/***********************************
 * Inicialização ao carregar página
 ***********************************/
window.onload = () => {
  exibirDataAtual();
  carregarAulaDoDia();
  setInterval(atualizarRelogio, 1000);
};
