// ============================================================================
// THE GREENWICH CORNER BOOKS - FRONT-END CRUD COM FETCH API
// Integra-se à API REST em Flask (http://127.0.0.1:5000/api) em ambiente local e
// ativa automaticamente o modo GitHub Pages (LocalStorage) quando hospedado online.
// ============================================================================

const API_BASE = "http://127.0.0.1:5000/api";
const isHostedOnGitHub =
    window.location.hostname.includes("github.io") ||
    (window.location.protocol !== "file:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1");

let modoDemoGitHub = isHostedOnGitHub;

let cacheCategorias = [];
let cacheClientes = [];
let cacheLivros = [];
let cachePedidos = [];
let carrinhoPedido = [];

// Dados iniciais sincronizados com database/banco.sql e backend/dao.py
const SEED_DATA = {
    categorias: [
        { id_categoria: 1, nome: "Clássicos Americanos" },
        { id_categoria: 2, nome: "Ficção Contemporânea" },
        { id_categoria: 3, nome: "Poesia & Ensaios" },
        { id_categoria: 4, nome: "Mistério & Noir" },
        { id_categoria: 5, nome: "Artes & Arquitetura" }
    ],
    clientes: [
        { id_cliente: 1, nome: "Clara Oswald", email: "clara.oswald@nycmail.com", telefone: "(212) 555-0142" },
        { id_cliente: 2, nome: "Arthur Pendelton", email: "arthur.p@villagebooks.com", telefone: "(212) 555-0198" },
        { id_cliente: 3, nome: "Maya Lin", email: "maya.lin@brooklyn.org", telefone: "(718) 555-0174" },
        { id_cliente: 4, nome: "Julian Vance", email: "julian.vance@soho.net", telefone: "(646) 555-0119" }
    ],
    livros: [
        { id_livro: 1, titulo: "O Grande Gatsby", autor: "F. Scott Fitzgerald", preco: 48.90, ano_publicacao: 1925, id_categoria: 1 },
        { id_livro: 2, titulo: "O Apanhador no Campo de Centeio", autor: "J. D. Salinger", preco: 54.00, ano_publicacao: 1951, id_categoria: 1 },
        { id_livro: 3, titulo: "A Redoma de Vidro", autor: "Sylvia Plath", preco: 46.50, ano_publicacao: 1963, id_categoria: 3 },
        { id_livro: 4, titulo: "Trilogia de Nova York", autor: "Paul Auster", preco: 62.00, ano_publicacao: 1987, id_categoria: 4 },
        { id_livro: 5, titulo: "Só Garotos", autor: "Patti Smith", preco: 59.90, ano_publicacao: 2010, id_categoria: 2 },
        { id_livro: 6, titulo: "O Sol é para Todos", autor: "Harper Lee", preco: 52.00, ano_publicacao: 1960, id_categoria: 1 }
    ],
    pedidos: [
        {
            id_pedido: 101,
            data_pedido: "2026-11-05",
            status: "Entregue",
            valor_total: 102.90,
            id_cliente: 1,
            itens: [
                { id_livro: 1, quantidade: 1, preco_unitario: 48.90 },
                { id_livro: 2, quantidade: 1, preco_unitario: 54.00 }
            ]
        },
        {
            id_pedido: 102,
            data_pedido: "2026-11-10",
            status: "Preparando",
            valor_total: 121.90,
            id_cliente: 2,
            itens: [
                { id_livro: 4, quantidade: 1, preco_unitario: 62.00 },
                { id_livro: 5, quantidade: 1, preco_unitario: 59.90 }
            ]
        },
        {
            id_pedido: 103,
            data_pedido: "2026-11-12",
            status: "Pendente",
            valor_total: 93.00,
            id_cliente: 3,
            itens: [
                { id_livro: 3, quantidade: 2, preco_unitario: 46.50 }
            ]
        }
    ]
};

function escapeHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getLocalDB() {
    const salvo = localStorage.getItem("greenwich_bookshop_db");
    if (!salvo) {
        localStorage.setItem("greenwich_bookshop_db", JSON.stringify(SEED_DATA));
        return JSON.parse(JSON.stringify(SEED_DATA));
    }
    return JSON.parse(salvo);
}

function saveLocalDB(db) {
    localStorage.setItem("greenwich_bookshop_db", JSON.stringify(db));
}

function mostrarFeedback(mensagem, tipo = "success") {
    const banner = document.getElementById("feedback-banner");
    banner.innerHTML = `<div class="feedback-msg ${tipo}">${escapeHtml(mensagem)}</div>`;
    setTimeout(() => {
        banner.innerHTML = "";
    }, 4500);
}

async function apiRequest(endpoint, options = {}) {
    if (!modoDemoGitHub) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.erro || "Erro na operação.");
            }
            return data;
        } catch (erro) {
            clearTimeout(timeoutId);
            const isNetworkOrTimeout =
                erro.name === "AbortError" ||
                (erro.message && (erro.message.includes("Failed to fetch") || erro.message.includes("NetworkError")));
            if (!isNetworkOrTimeout) {
                throw erro;
            }
            modoDemoGitHub = true;
            atualizarBadgeConexao();
        }
    }

    return executarNoLocalStorage(endpoint, options);
}

function executarNoLocalStorage(endpoint, options) {
    const db = getLocalDB();
    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;

    if (endpoint === "/categorias" && method === "GET") return db.categorias;
    if (endpoint === "/categorias" && method === "POST") {
        const novoId = db.categorias.length ? Math.max(...db.categorias.map(c => c.id_categoria)) + 1 : 1;
        db.categorias.push({ id_categoria: novoId, nome: body.nome });
        saveLocalDB(db);
        return { id_categoria: novoId, mensagem: "Categoria cadastrada!" };
    }
    if (endpoint.startsWith("/categorias/") && method === "PUT") {
        const id = parseInt(endpoint.split("/")[2], 10);
        const item = db.categorias.find(c => c.id_categoria === id);
        if (item) item.nome = body.nome;
        saveLocalDB(db);
        return { mensagem: "Categoria atualizada!" };
    }
    if (endpoint.startsWith("/categorias/") && method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2], 10);
        if (db.livros.some(l => l.id_categoria === id)) {
            throw new Error("Não é possível excluir: existem livros vinculados a esta categoria.");
        }
        db.categorias = db.categorias.filter(c => c.id_categoria !== id);
        saveLocalDB(db);
        return { mensagem: "Categoria removida!" };
    }

    if (endpoint === "/clientes" && method === "GET") return db.clientes;
    if (endpoint === "/clientes" && method === "POST") {
        if (db.clientes.some(c => c.email.toLowerCase() === body.email.toLowerCase())) {
            throw new Error("Este e-mail já está cadastrado para outro cliente.");
        }
        const novoId = db.clientes.length ? Math.max(...db.clientes.map(c => c.id_cliente)) + 1 : 1;
        db.clientes.push({ id_cliente: novoId, nome: body.nome, email: body.email, telefone: body.telefone || "" });
        saveLocalDB(db);
        return { id_cliente: novoId, mensagem: "Cliente cadastrado!" };
    }
    if (endpoint.startsWith("/clientes/") && method === "PUT") {
        const id = parseInt(endpoint.split("/")[2], 10);
        if (db.clientes.some(c => c.email.toLowerCase() === body.email.toLowerCase() && c.id_cliente !== id)) {
            throw new Error("Este e-mail já pertence a outro cliente.");
        }
        const cli = db.clientes.find(c => c.id_cliente === id);
        if (cli) Object.assign(cli, body);
        saveLocalDB(db);
        return { mensagem: "Cliente atualizado!" };
    }
    if (endpoint.startsWith("/clientes/") && method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2], 10);
        if (db.pedidos.some(p => p.id_cliente === id)) {
            throw new Error("Não é possível excluir: este cliente possui pedidos registrados.");
        }
        db.clientes = db.clientes.filter(c => c.id_cliente !== id);
        saveLocalDB(db);
        return { mensagem: "Cliente removido!" };
    }

    if (endpoint === "/livros" && method === "GET") {
        return db.livros.map(l => {
            const cat = db.categorias.find(c => c.id_categoria === l.id_categoria);
            return { ...l, nome_categoria: cat ? cat.nome : "Sem Categoria" };
        }).reverse();
    }
    if (endpoint === "/livros" && method === "POST") {
        const novoId = db.livros.length ? Math.max(...db.livros.map(l => l.id_livro)) + 1 : 1;
        db.livros.push({ id_livro: novoId, ...body });
        saveLocalDB(db);
        return { id_livro: novoId, mensagem: "Livro adicionado!" };
    }
    if (endpoint.startsWith("/livros/") && method === "PUT") {
        const id = parseInt(endpoint.split("/")[2], 10);
        const liv = db.livros.find(l => l.id_livro === id);
        if (liv) Object.assign(liv, body);
        saveLocalDB(db);
        return { mensagem: "Livro atualizado!" };
    }
    if (endpoint.startsWith("/livros/") && method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2], 10);
        const emPedido = db.pedidos.some(p => p.itens.some(i => i.id_livro === id));
        if (emPedido) {
            throw new Error("Não é possível excluir: este livro faz parte de um pedido registrado.");
        }
        db.livros = db.livros.filter(l => l.id_livro !== id);
        saveLocalDB(db);
        return { mensagem: "Livro removido!" };
    }

    if (endpoint === "/pedidos" && method === "GET") {
        return db.pedidos.map(p => {
            const cli = db.clientes.find(c => c.id_cliente === p.id_cliente);
            const itensEnriquecidos = p.itens.map(i => {
                const liv = db.livros.find(l => l.id_livro === i.id_livro);
                return { ...i, titulo_livro: liv ? liv.titulo : `Livro #${i.id_livro}` };
            });
            return { ...p, nome_cliente: cli ? cli.nome : "Cliente", itens: itensEnriquecidos };
        }).reverse();
    }
    if (endpoint === "/pedidos" && method === "POST") {
        const novoId = db.pedidos.length ? Math.max(...db.pedidos.map(p => p.id_pedido)) + 1 : 101;
        const total = body.itens.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0);
        const hoje = new Date().toISOString().split("T")[0];
        db.pedidos.push({
            id_pedido: novoId,
            data_pedido: hoje,
            status: body.status || "Pendente",
            valor_total: total,
            id_cliente: body.id_cliente,
            itens: body.itens
        });
        saveLocalDB(db);
        return { id_pedido: novoId, mensagem: "Pedido registrado!" };
    }
    if (endpoint.startsWith("/pedidos/") && method === "PUT") {
        const id = parseInt(endpoint.split("/")[2], 10);
        const ped = db.pedidos.find(p => p.id_pedido === id);
        if (ped) ped.status = body.status;
        saveLocalDB(db);
        return { mensagem: "Status atualizado!" };
    }
    if (endpoint.startsWith("/pedidos/") && method === "DELETE") {
        const id = parseInt(endpoint.split("/")[2], 10);
        db.pedidos = db.pedidos.filter(p => p.id_pedido !== id);
        saveLocalDB(db);
        return { mensagem: "Pedido excluído!" };
    }

    return {};
}

function atualizarBadgeConexao() {
    const badge = document.getElementById("api-status-badge");
    if (modoDemoGitHub) {
        badge.textContent = "Modo GitHub Pages (Persistência Local Ativa)";
        badge.className = "status-pill demo";
    } else {
        badge.textContent = "API REST Flask + SQLite Conectada";
        badge.className = "status-pill online";
    }
}

async function carregarTudo() {
    await carregarCategorias();
    await carregarClientes();
    await carregarLivros();
    await carregarPedidos();
    atualizarBadgeConexao();
}

async function carregarCategorias() {
    cacheCategorias = await apiRequest("/categorias");
    const lista = document.getElementById("lista-categorias");
    const selectLivro = document.getElementById("livro-categoria");

    lista.innerHTML = "";
    selectLivro.innerHTML = "";

    cacheCategorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id_categoria;
        option.textContent = cat.nome;
        selectLivro.appendChild(option);

        const div = document.createElement("div");
        div.className = "item-card";
        div.innerHTML = `
            <div class="item-info">
                <h3>${escapeHtml(cat.nome)}</h3>
                <span class="item-meta">Código #${cat.id_categoria}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editarCategoria(${cat.id_categoria})">Editar</button>
                <button class="btn-del" onclick="excluirCategoria(${cat.id_categoria})">Excluir</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

async function carregarClientes() {
    cacheClientes = await apiRequest("/clientes");
    const lista = document.getElementById("lista-clientes");
    const selectPedido = document.getElementById("pedido-cliente");

    lista.innerHTML = "";
    selectPedido.innerHTML = "";

    cacheClientes.forEach(cli => {
        const option = document.createElement("option");
        option.value = cli.id_cliente;
        option.textContent = `${cli.nome} (${cli.email})`;
        selectPedido.appendChild(option);

        const div = document.createElement("div");
        div.className = "item-card";
        div.innerHTML = `
            <div class="item-info">
                <h3>${escapeHtml(cli.nome)}</h3>
                <div class="item-meta">${escapeHtml(cli.email)} ${cli.telefone ? "• " + escapeHtml(cli.telefone) : ""}</div>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editarCliente(${cli.id_cliente})">Editar</button>
                <button class="btn-del" onclick="excluirCliente(${cli.id_cliente})">Excluir</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

async function carregarLivros() {
    cacheLivros = await apiRequest("/livros");
    renderizarLivros(cacheLivros);

    const selectPedidoLivro = document.getElementById("pedido-livro-select");
    selectPedidoLivro.innerHTML = "";
    cacheLivros.forEach(liv => {
        const opt = document.createElement("option");
        opt.value = liv.id_livro;
        opt.textContent = `${liv.titulo} — R$ ${Number(liv.preco).toFixed(2)}`;
        selectPedidoLivro.appendChild(opt);
    });
}

function renderizarLivros(livros) {
    const lista = document.getElementById("lista-livros");
    lista.innerHTML = "";

    if (!livros.length) {
        lista.innerHTML = `<p class="empty-hint">Nenhum livro encontrado na prateleira.</p>`;
        return;
    }

    livros.forEach(liv => {
        const div = document.createElement("div");
        div.className = "item-card";
        div.innerHTML = `
            <div class="item-info">
                <h3>${escapeHtml(liv.titulo)}</h3>
                <div class="item-meta">por <strong>${escapeHtml(liv.autor)}</strong> (${liv.ano_publicacao}) • <strong>R$ ${Number(liv.preco).toFixed(2)}</strong></div>
                <span class="tag-categoria">${escapeHtml(liv.nome_categoria || "Geral")}</span>
            </div>
            <div class="item-actions">
                <button class="btn-edit" onclick="editarLivro(${liv.id_livro})">Editar</button>
                <button class="btn-del" onclick="excluirLivro(${liv.id_livro})">Excluir</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

async function carregarPedidos() {
    cachePedidos = await apiRequest("/pedidos");
    const lista = document.getElementById("lista-pedidos");
    lista.innerHTML = "";

    if (!cachePedidos.length) {
        lista.innerHTML = `<p class="empty-hint">Nenhum pedido registrado ainda.</p>`;
        return;
    }

    cachePedidos.forEach(ped => {
        const resumoItens = ped.itens
            .map(i => `${i.quantidade}x ${escapeHtml(i.titulo_livro)} (R$ ${Number(i.preco_unitario).toFixed(2)})`)
            .join(" • ");

        const div = document.createElement("div");
        div.className = "item-card";
        div.innerHTML = `
            <div class="item-info">
                <h3>Pedido #${ped.id_pedido} — ${escapeHtml(ped.nome_cliente)}</h3>
                <div class="item-meta">Data: ${escapeHtml(ped.data_pedido)} • Total: <strong>R$ ${Number(ped.valor_total).toFixed(2)}</strong></div>
                <div class="item-meta" style="margin-top: 4px;">${resumoItens}</div>
            </div>
            <div class="item-actions">
                <select class="status-select-inline" onchange="alterarStatusPedido(${ped.id_pedido}, this.value)" aria-label="Status do pedido">
                    <option value="Pendente" ${ped.status === "Pendente" ? "selected" : ""}>Pendente</option>
                    <option value="Preparando" ${ped.status === "Preparando" ? "selected" : ""}>Preparando</option>
                    <option value="Entregue" ${ped.status === "Entregue" ? "selected" : ""}>Entregue</option>
                </select>
                <button class="btn-del" onclick="excluirPedido(${ped.id_pedido})">Excluir</button>
            </div>
        `;
        lista.appendChild(div);
    });
}

document.getElementById("form-livro").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("livro-id").value;
    const payload = {
        titulo: document.getElementById("livro-titulo").value.trim(),
        autor: document.getElementById("livro-autor").value.trim(),
        preco: parseFloat(document.getElementById("livro-preco").value),
        ano_publicacao: parseInt(document.getElementById("livro-ano").value, 10),
        id_categoria: parseInt(document.getElementById("livro-categoria").value, 10)
    };

    try {
        if (id) {
            await apiRequest(`/livros/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            mostrarFeedback("Livro atualizado na prateleira!");
        } else {
            await apiRequest("/livros", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            mostrarFeedback("Novo livro cadastrado no acervo!");
        }
        resetFormLivro();
        await carregarLivros();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

function editarLivro(id) {
    const liv = cacheLivros.find(l => l.id_livro === id);
    if (!liv) return;
    document.getElementById("livro-id").value = liv.id_livro;
    document.getElementById("livro-titulo").value = liv.titulo;
    document.getElementById("livro-autor").value = liv.autor;
    document.getElementById("livro-preco").value = liv.preco;
    document.getElementById("livro-ano").value = liv.ano_publicacao;
    document.getElementById("livro-categoria").value = liv.id_categoria;
    document.getElementById("titulo-form-livro").textContent = "Editar Livro";
    document.getElementById("btn-cancelar-livro").classList.remove("hidden");
}

function resetFormLivro() {
    document.getElementById("form-livro").reset();
    document.getElementById("livro-id").value = "";
    document.getElementById("titulo-form-livro").textContent = "Cadastrar Livro no Acervo";
    document.getElementById("btn-cancelar-livro").classList.add("hidden");
}

document.getElementById("btn-cancelar-livro").addEventListener("click", resetFormLivro);

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

document.getElementById("busca-livro").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = cacheLivros.filter(
        l => l.titulo.toLowerCase().includes(termo) || l.autor.toLowerCase().includes(termo)
    );
    renderizarLivros(filtrados);
});

document.getElementById("form-categoria").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("categoria-id").value;
    const payload = { nome: document.getElementById("categoria-nome").value.trim() };

    try {
        if (id) {
            await apiRequest(`/categorias/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            mostrarFeedback("Categoria atualizada!");
        } else {
            await apiRequest("/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            mostrarFeedback("Categoria criada!");
        }
        resetFormCategoria();
        await carregarCategorias();
        await carregarLivros();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

function editarCategoria(id) {
    const cat = cacheCategorias.find(c => c.id_categoria === id);
    if (!cat) return;
    document.getElementById("categoria-id").value = cat.id_categoria;
    document.getElementById("categoria-nome").value = cat.nome;
    document.getElementById("titulo-form-categoria").textContent = "Editar Categoria";
    document.getElementById("btn-cancelar-categoria").classList.remove("hidden");
}

function resetFormCategoria() {
    document.getElementById("form-categoria").reset();
    document.getElementById("categoria-id").value = "";
    document.getElementById("titulo-form-categoria").textContent = "Nova Categoria";
    document.getElementById("btn-cancelar-categoria").classList.add("hidden");
}

document.getElementById("btn-cancelar-categoria").addEventListener("click", resetFormCategoria);

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

document.getElementById("form-cliente").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("cliente-id").value;
    const payload = {
        nome: document.getElementById("cliente-nome").value.trim(),
        email: document.getElementById("cliente-email").value.trim(),
        telefone: document.getElementById("cliente-telefone").value.trim()
    };

    try {
        if (id) {
            await apiRequest(`/clientes/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            mostrarFeedback("Dados do leitor atualizados!");
        } else {
            await apiRequest("/clientes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            mostrarFeedback("Leitor cadastrado com sucesso!");
        }
        resetFormCliente();
        await carregarClientes();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

function editarCliente(id) {
    const cli = cacheClientes.find(c => c.id_cliente === id);
    if (!cli) return;
    document.getElementById("cliente-id").value = cli.id_cliente;
    document.getElementById("cliente-nome").value = cli.nome;
    document.getElementById("cliente-email").value = cli.email;
    document.getElementById("cliente-telefone").value = cli.telefone || "";
    document.getElementById("titulo-form-cliente").textContent = "Editar Leitor";
    document.getElementById("btn-cancelar-cliente").classList.remove("hidden");
}

function resetFormCliente() {
    document.getElementById("form-cliente").reset();
    document.getElementById("cliente-id").value = "";
    document.getElementById("titulo-form-cliente").textContent = "Cadastrar Leitor";
    document.getElementById("btn-cancelar-cliente").classList.add("hidden");
}

document.getElementById("btn-cancelar-cliente").addEventListener("click", resetFormCliente);

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

document.getElementById("btn-add-item").addEventListener("click", () => {
    const idLivro = parseInt(document.getElementById("pedido-livro-select").value, 10);
    const qtd = parseInt(document.getElementById("pedido-livro-qtd").value, 10);
    const livro = cacheLivros.find(l => l.id_livro === idLivro);

    if (!livro || qtd < 1) return;

    const existente = carrinhoPedido.find(i => i.id_livro === idLivro);
    if (existente) {
        existente.quantidade += qtd;
    } else {
        carrinhoPedido.push({
            id_livro: livro.id_livro,
            titulo: livro.titulo,
            quantidade: qtd,
            preco_unitario: Number(livro.preco)
        });
    }
    renderizarCarrinho();
});

function removerItemCarrinho(idLivro) {
    carrinhoPedido = carrinhoPedido.filter(i => i.id_livro !== idLivro);
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const box = document.getElementById("carrinho-itens");
    const totalEl = document.getElementById("pedido-total");

    if (!carrinhoPedido.length) {
        box.innerHTML = `<p class="empty-hint">Nenhum livro adicionado ao pedido ainda.</p>`;
        totalEl.textContent = "R$ 0,00";
        return;
    }

    let total = 0;
    box.innerHTML = "";
    carrinhoPedido.forEach(item => {
        const subtotal = item.quantidade * item.preco_unitario;
        total += subtotal;
        box.innerHTML += `
            <div class="cart-line">
                <span>${item.quantidade}x <strong>${escapeHtml(item.titulo)}</strong></span>
                <span>R$ ${subtotal.toFixed(2)} <button type="button" class="btn-del" style="padding: 2px 6px; margin-left: 6px;" onclick="removerItemCarrinho(${item.id_livro})">x</button></span>
            </div>
        `;
    });
    totalEl.textContent = `R$ ${total.toFixed(2)}`;
}

document.getElementById("form-pedido").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!carrinhoPedido.length) {
        mostrarFeedback("Adicione pelo menos um livro ao carrinho antes de finalizar.", "error");
        return;
    }

    const payload = {
        id_cliente: parseInt(document.getElementById("pedido-cliente").value, 10),
        status: document.getElementById("pedido-status").value,
        itens: carrinhoPedido.map(i => ({
            id_livro: i.id_livro,
            quantidade: i.quantidade,
            preco_unitario: i.preco_unitario
        }))
    };

    try {
        await apiRequest("/pedidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        carrinhoPedido = [];
        renderizarCarrinho();
        mostrarFeedback("Pedido registrado com sucesso!");
        await carregarPedidos();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
});

async function alterarStatusPedido(idPedido, novoStatus) {
    try {
        await apiRequest(`/pedidos/${idPedido}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus })
        });
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

document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
    });
});

document.addEventListener("DOMContentLoaded", carregarTudo);
