// Funções de apoio usadas por todas as páginas.

function el(id) {
    return document.getElementById(id);
}

function escapeHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

let temporizadorFeedback;

function mostrarFeedback(mensagem, tipo = "success") {
    const banner = el("feedback-banner");
    banner.innerHTML = `<div class="feedback-msg ${tipo}">${escapeHtml(mensagem)}</div>`;
    clearTimeout(temporizadorFeedback);
    temporizadorFeedback = setTimeout(() => {
        banner.innerHTML = "";
    }, 4500);
}

// Liga os botões <button data-acao="..." data-id="..."> de uma lista às funções de `acoes`.
// Exemplo: ligarAcoes("lista-livros", { editar: editarLivro, excluir: excluirLivro });
function ligarAcoes(idContainer, acoes) {
    el(idContainer).addEventListener("click", (evento) => {
        const botao = evento.target.closest("button[data-acao]");
        const acao = botao && acoes[botao.dataset.acao];
        if (acao) acao(Number(botao.dataset.id));
    });
}
