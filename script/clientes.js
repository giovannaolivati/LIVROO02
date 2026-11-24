// Página "Leitores & Clientes" (index/clientes.html)

let cacheClientes = [];

async function carregarClientes() {
    cacheClientes = await apiRequest("/clientes");
    const lista = el("lista-clientes");

    if (!cacheClientes.length) {
        lista.innerHTML = `<p class="empty-hint">Nenhum leitor cadastrado ainda.</p>`;
        return;
    }

    lista.innerHTML = cacheClientes.map(cli => `
        <div class="item-card">
            <div class="item-info">
                <h3>${escapeHtml(cli.nome)}</h3>
                <div class="item-meta">${escapeHtml(cli.email)} ${cli.telefone ? "• " + escapeHtml(cli.telefone) : ""}</div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" data-acao="editar" data-id="${cli.id_cliente}">Editar</button>
                <button class="btn-del" data-acao="excluir" data-id="${cli.id_cliente}">Excluir</button>
            </div>
        </div>
    `).join("");
}

function editarCliente(id) {
    const cli = cacheClientes.find(c => c.id_cliente === id);
    if (!cli) return;
    el("cliente-id").value = cli.id_cliente;
    el("cliente-nome").value = cli.nome;
    el("cliente-email").value = cli.email;
    el("cliente-telefone").value = cli.telefone || "";
    el("titulo-form-cliente").textContent = "Editar Leitor";
    el("btn-cancelar-cliente").classList.remove("hidden");
}

function resetFormCliente() {
    el("form-cliente").reset();
    el("cliente-id").value = "";
    el("titulo-form-cliente").textContent = "Cadastrar Leitor";
    el("btn-cancelar-cliente").classList.add("hidden");
}

async function excluirCliente(id) {
    if (!confirm("Remover este cliente?")) return;
    try {
        await apiRequest(`/clientes/${id}`, { method: "DELETE" });
        mostrarFeedback("Cliente removido.");
        await carregarClientes();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
}

el("form-cliente").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = el("cliente-id").value;
    const payload = {
        nome: el("cliente-nome").value.trim(),
        email: el("cliente-email").value.trim(),
        telefone: el("cliente-telefone").value.trim()
    };

    try {
        if (id) {
            await enviarJson(`/clientes/${id}`, "PUT", payload);
            mostrarFeedback("Dados do leitor atualizados!");
        } else {
            await enviarJson("/clientes", "POST", payload);
            mostrarFeedback("Leitor cadastrado com sucesso!");
        }
        resetFormCliente();
        await carregarClientes();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

el("btn-cancelar-cliente").addEventListener("click", resetFormCliente);
ligarAcoes("lista-clientes", { editar: editarCliente, excluir: excluirCliente });

iniciarPagina(carregarClientes);
