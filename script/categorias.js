// Página "Categorias" (index/categorias.html)

let cacheCategorias = [];

async function carregarCategorias() {
    cacheCategorias = await apiRequest("/categorias");
    const lista = el("lista-categorias");

    if (!cacheCategorias.length) {
        lista.innerHTML = `<p class="empty-hint">Nenhuma categoria cadastrada ainda.</p>`;
        return;
    }

    lista.innerHTML = cacheCategorias.map(cat => `
        <div class="item-card">
            <div class="item-info">
                <h3>${escapeHtml(cat.nome)}</h3>
                <span class="item-meta">Código #${cat.id_categoria}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" data-acao="editar" data-id="${cat.id_categoria}">Editar</button>
                <button class="btn-del" data-acao="excluir" data-id="${cat.id_categoria}">Excluir</button>
            </div>
        </div>
    `).join("");
}

function editarCategoria(id) {
    const cat = cacheCategorias.find(c => c.id_categoria === id);
    if (!cat) return;
    el("categoria-id").value = cat.id_categoria;
    el("categoria-nome").value = cat.nome;
    el("titulo-form-categoria").textContent = "Editar Categoria";
    el("btn-cancelar-categoria").classList.remove("hidden");
}

function resetFormCategoria() {
    el("form-categoria").reset();
    el("categoria-id").value = "";
    el("titulo-form-categoria").textContent = "Nova Categoria";
    el("btn-cancelar-categoria").classList.add("hidden");
}

async function excluirCategoria(id) {
    if (!confirm("Deseja excluir esta categoria?")) return;
    try {
        await apiRequest(`/categorias/${id}`, { method: "DELETE" });
        mostrarFeedback("Categoria excluída.");
        await carregarCategorias();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
}

el("form-categoria").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = el("categoria-id").value;
    const payload = { nome: el("categoria-nome").value.trim() };

    try {
        if (id) {
            await enviarJson(`/categorias/${id}`, "PUT", payload);
            mostrarFeedback("Categoria atualizada!");
        } else {
            await enviarJson("/categorias", "POST", payload);
            mostrarFeedback("Categoria criada!");
        }
        resetFormCategoria();
        await carregarCategorias();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

el("btn-cancelar-categoria").addEventListener("click", resetFormCategoria);
ligarAcoes("lista-categorias", { editar: editarCategoria, excluir: excluirCategoria });

iniciarPagina(carregarCategorias);
