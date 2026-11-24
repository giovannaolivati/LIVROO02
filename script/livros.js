// Página "Acervo de Livros" (index/livros.html)

let cacheLivros = [];

async function carregarCategorias() {
    const categorias = await apiRequest("/categorias");
    el("livro-categoria").innerHTML = categorias
        .map(cat => `<option value="${cat.id_categoria}">${escapeHtml(cat.nome)}</option>`)
        .join("");
}

async function carregarLivros() {
    cacheLivros = await apiRequest("/livros");
    aplicarBusca();
}

function aplicarBusca() {
    const termo = el("busca-livro").value.trim().toLowerCase();
    renderizarLivros(cacheLivros.filter(
        livro => livro.titulo.toLowerCase().includes(termo) || livro.autor.toLowerCase().includes(termo)
    ));
}

function renderizarLivros(livros) {
    const lista = el("lista-livros");

    if (!livros.length) {
        lista.innerHTML = `<p class="empty-hint">Nenhum livro encontrado na prateleira.</p>`;
        return;
    }

    lista.innerHTML = livros.map(liv => `
        <div class="item-card">
            <div class="item-info">
                <h3>${escapeHtml(liv.titulo)}</h3>
                <div class="item-meta">por <strong>${escapeHtml(liv.autor)}</strong> (${liv.ano_publicacao}) • <strong>${formatarPreco(liv.preco)}</strong></div>
                <span class="tag-categoria">${escapeHtml(liv.nome_categoria || "Geral")}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" data-acao="editar" data-id="${liv.id_livro}">Editar</button>
                <button class="btn-del" data-acao="excluir" data-id="${liv.id_livro}">Excluir</button>
            </div>
        </div>
    `).join("");
}

function editarLivro(id) {
    const liv = cacheLivros.find(l => l.id_livro === id);
    if (!liv) return;
    el("livro-id").value = liv.id_livro;
    el("livro-titulo").value = liv.titulo;
    el("livro-autor").value = liv.autor;
    el("livro-preco").value = liv.preco;
    el("livro-ano").value = liv.ano_publicacao;
    el("livro-categoria").value = liv.id_categoria;
    el("titulo-form-livro").textContent = "Editar Livro";
    el("btn-cancelar-livro").classList.remove("hidden");
}

function resetFormLivro() {
    el("form-livro").reset();
    el("livro-id").value = "";
    el("titulo-form-livro").textContent = "Cadastrar Livro no Acervo";
    el("btn-cancelar-livro").classList.add("hidden");
}

async function excluirLivro(id) {
    if (!confirm("Remover este livro da estante?")) return;
    try {
        await apiRequest(`/livros/${id}`, { method: "DELETE" });
        mostrarFeedback("Livro removido do acervo.");
        await carregarLivros();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
}

el("form-livro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = el("livro-id").value;
    const payload = {
        titulo: el("livro-titulo").value.trim(),
        autor: el("livro-autor").value.trim(),
        preco: parseFloat(el("livro-preco").value),
        ano_publicacao: parseInt(el("livro-ano").value, 10),
        id_categoria: parseInt(el("livro-categoria").value, 10)
    };

    try {
        if (id) {
            await enviarJson(`/livros/${id}`, "PUT", payload);
            mostrarFeedback("Livro atualizado na prateleira!");
        } else {
            await enviarJson("/livros", "POST", payload);
            mostrarFeedback("Novo livro cadastrado no acervo!");
        }
        resetFormLivro();
        await carregarLivros();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

el("btn-cancelar-livro").addEventListener("click", resetFormLivro);
el("busca-livro").addEventListener("input", aplicarBusca);
ligarAcoes("lista-livros", { editar: editarLivro, excluir: excluirLivro });

iniciarPagina(async () => {
    await carregarCategorias();
    await carregarLivros();
});
