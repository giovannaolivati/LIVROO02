// Página "Pedidos & Caixa" (index/pedidos.html)

let cacheLivros = [];
let carrinhoPedido = [];

async function carregarClientes() {
    const clientes = await apiRequest("/clientes");
    el("pedido-cliente").innerHTML = clientes
        .map(cli => `<option value="${cli.id_cliente}">${escapeHtml(cli.nome)} (${escapeHtml(cli.email)})</option>`)
        .join("");
}

async function carregarLivros() {
    cacheLivros = await apiRequest("/livros");
    el("pedido-livro-select").innerHTML = cacheLivros
        .map(liv => `<option value="${liv.id_livro}">${escapeHtml(liv.titulo)} — ${formatarPreco(liv.preco)}</option>`)
        .join("");
}

async function carregarPedidos() {
    const pedidos = await apiRequest("/pedidos");
    const lista = el("lista-pedidos");

    if (!pedidos.length) {
        lista.innerHTML = `<p class="empty-hint">Nenhum pedido registrado ainda.</p>`;
        return;
    }

    lista.innerHTML = pedidos.map(ped => {
        const resumoItens = ped.itens
            .map(i => `${i.quantidade}x ${escapeHtml(i.titulo_livro)} (${formatarPreco(i.preco_unitario)})`)
            .join(" • ");
        const opcoesStatus = ["Pendente", "Preparando", "Entregue"]
            .map(s => `<option value="${s}" ${ped.status === s ? "selected" : ""}>${s}</option>`)
            .join("");

        return `
            <div class="item-card">
                <div class="item-info">
                    <h3>Pedido #${ped.id_pedido} — ${escapeHtml(ped.nome_cliente)}</h3>
                    <div class="item-meta">Data: ${escapeHtml(ped.data_pedido)} • Total: <strong>${formatarPreco(ped.valor_total)}</strong></div>
                    <div class="item-meta item-meta-itens">${resumoItens}</div>
                </div>
                <div class="item-actions">
                    <select class="status-select-inline" data-pedido="${ped.id_pedido}" aria-label="Status do pedido">${opcoesStatus}</select>
                    <button class="btn-del" data-acao="excluir" data-id="${ped.id_pedido}">Excluir</button>
                </div>
            </div>
        `;
    }).join("");
}

function renderizarCarrinho() {
    const caixa = el("carrinho-itens");

    if (!carrinhoPedido.length) {
        caixa.innerHTML = `<p class="empty-hint">Nenhum livro adicionado ao pedido ainda.</p>`;
        el("pedido-total").textContent = formatarPreco(0);
        return;
    }

    let total = 0;
    caixa.innerHTML = carrinhoPedido.map(item => {
        const subtotal = item.quantidade * item.preco_unitario;
        total += subtotal;
        return `
            <div class="cart-line">
                <span>${item.quantidade}x <strong>${escapeHtml(item.titulo)}</strong></span>
                <span>${formatarPreco(subtotal)} <button type="button" class="btn-del btn-remover-item" data-acao="remover" data-id="${item.id_livro}">x</button></span>
            </div>
        `;
    }).join("");
    el("pedido-total").textContent = formatarPreco(total);
}

function adicionarItemAoCarrinho() {
    const idLivro = parseInt(el("pedido-livro-select").value, 10);
    const quantidade = parseInt(el("pedido-livro-qtd").value, 10);
    const livro = cacheLivros.find(l => l.id_livro === idLivro);

    if (!livro || !(quantidade >= 1)) return;

    const existente = carrinhoPedido.find(i => i.id_livro === idLivro);
    if (existente) {
        existente.quantidade += quantidade;
    } else {
        carrinhoPedido.push({
            id_livro: livro.id_livro,
            titulo: livro.titulo,
            quantidade,
            preco_unitario: Number(livro.preco)
        });
    }
    renderizarCarrinho();
}

function removerItemCarrinho(idLivro) {
    carrinhoPedido = carrinhoPedido.filter(i => i.id_livro !== idLivro);
    renderizarCarrinho();
}

async function alterarStatusPedido(idPedido, novoStatus) {
    try {
        await enviarJson(`/pedidos/${idPedido}`, "PUT", { status: novoStatus });
        mostrarFeedback(`Status do pedido #${idPedido} alterado para "${novoStatus}".`);
        await carregarPedidos();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
}

async function excluirPedido(idPedido) {
    if (!confirm(`Excluir o pedido #${idPedido}?`)) return;
    try {
        await apiRequest(`/pedidos/${idPedido}`, { method: "DELETE" });
        mostrarFeedback("Pedido removido.");
        await carregarPedidos();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
}

el("form-pedido").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!carrinhoPedido.length) {
        mostrarFeedback("Adicione pelo menos um livro ao carrinho antes de finalizar.", "error");
        return;
    }

    const payload = {
        id_cliente: parseInt(el("pedido-cliente").value, 10),
        status: el("pedido-status").value,
        itens: carrinhoPedido.map(i => ({
            id_livro: i.id_livro,
            quantidade: i.quantidade,
            preco_unitario: i.preco_unitario
        }))
    };

    try {
        await enviarJson("/pedidos", "POST", payload);
        carrinhoPedido = [];
        renderizarCarrinho();
        mostrarFeedback("Pedido registrado com sucesso!");
        await carregarPedidos();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

el("btn-add-item").addEventListener("click", adicionarItemAoCarrinho);
ligarAcoes("carrinho-itens", { remover: removerItemCarrinho });
ligarAcoes("lista-pedidos", { excluir: excluirPedido });
el("lista-pedidos").addEventListener("change", (evento) => {
    const seletor = evento.target.closest("select[data-pedido]");
    if (seletor) alterarStatusPedido(Number(seletor.dataset.pedido), seletor.value);
});

iniciarPagina(async () => {
    await carregarClientes();
    await carregarLivros();
    await carregarPedidos();
});
