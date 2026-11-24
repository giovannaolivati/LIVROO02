// Comunicação com a API Flask (back-end/app.py) em http://127.0.0.1:5000/api.
// Quando a API não responde, ou quando o site está hospedado online (GitHub Pages),
// entra o modo demonstração: os dados ficam no localStorage do navegador.

const API_BASE = "http://127.0.0.1:5000/api";
const CHAVE_BANCO_LOCAL = "greenwich_bookshop_db";

const hospedadoOnline =
    window.location.hostname.includes("github.io") ||
    (window.location.protocol !== "file:" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1");

let modoDemo = hospedadoOnline;

async function apiRequest(endpoint, options = {}) {
    if (!modoDemo) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                signal: controller.signal
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.erro || "Erro na operação.");
            }
            return data;
        } catch (erro) {
            // Sem conexão (ou demorou demais): cai para o modo demonstração.
            const semConexao = erro.name === "AbortError" || erro instanceof TypeError;
            if (!semConexao) {
                throw erro;
            }
            modoDemo = true;
            atualizarBadgeConexao();
        } finally {
            clearTimeout(timeoutId);
        }
    }

    return executarNoLocalStorage(endpoint, options);
}

// Envia um corpo JSON (POST ou PUT) pela API.
function enviarJson(endpoint, metodo, dados) {
    return apiRequest(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    });
}

// Carrega a página: roda `carregar`, mostra o erro (se houver) e atualiza o selo de conexão.
async function iniciarPagina(carregar) {
    try {
        await carregar();
    } catch (erro) {
        mostrarFeedback(erro.message, "error");
    }
    atualizarBadgeConexao();
}

function atualizarBadgeConexao() {
    const badge = el("api-status-badge");
    if (modoDemo) {
        badge.textContent = "Modo demonstração (dados salvos neste navegador)";
        badge.className = "status-pill demo";
    } else {
        badge.textContent = "API REST Flask + SQLite Conectada";
        badge.className = "status-pill online";
    }
}

// ---------------------------------------------------------------------------
// Modo demonstração: imita no localStorage o que a API Flask faz no SQLite.
// ---------------------------------------------------------------------------

function lerBancoLocal() {
    const salvo = localStorage.getItem(CHAVE_BANCO_LOCAL);
    if (!salvo) {
        salvarBancoLocal(DADOS_INICIAIS);
        return JSON.parse(JSON.stringify(DADOS_INICIAIS));
    }
    return JSON.parse(salvo);
}

function salvarBancoLocal(db) {
    localStorage.setItem(CHAVE_BANCO_LOCAL, JSON.stringify(db));
}

function proximoId(lista, campo, inicial = 1) {
    return lista.length ? Math.max(...lista.map(item => item[campo])) + 1 : inicial;
}

function dataDeHoje() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${hoje.getFullYear()}-${mes}-${dia}`;
}

// "/livros/3" -> recurso "livros" e id 3
function executarNoLocalStorage(endpoint, options) {
    const db = lerBancoLocal();
    const metodo = (options.method || "GET").toUpperCase();
    const corpo = options.body ? JSON.parse(options.body) : {};
    const [, recurso, idTexto] = endpoint.split("/");
    const id = idTexto ? parseInt(idTexto, 10) : null;

    const rotas = {
        categorias: rotaCategorias,
        clientes: rotaClientes,
        livros: rotaLivros,
        pedidos: rotaPedidos
    };
    const rota = rotas[recurso];
    return rota ? rota(db, metodo, id, corpo) : {};
}

function rotaCategorias(db, metodo, id, corpo) {
    if (metodo === "GET") return db.categorias;

    if (metodo === "POST") {
        const novoId = proximoId(db.categorias, "id_categoria");
        db.categorias.push({ id_categoria: novoId, nome: corpo.nome });
        salvarBancoLocal(db);
        return { id_categoria: novoId, mensagem: "Categoria cadastrada!" };
    }

    if (metodo === "PUT") {
        const categoria = db.categorias.find(c => c.id_categoria === id);
        if (categoria) categoria.nome = corpo.nome;
        salvarBancoLocal(db);
        return { mensagem: "Categoria atualizada!" };
    }

    if (metodo === "DELETE") {
        if (db.livros.some(l => l.id_categoria === id)) {
            throw new Error("Não é possível excluir: existem livros vinculados a esta categoria.");
        }
        db.categorias = db.categorias.filter(c => c.id_categoria !== id);
        salvarBancoLocal(db);
        return { mensagem: "Categoria removida!" };
    }

    return {};
}

function rotaClientes(db, metodo, id, corpo) {
    if (metodo === "GET") return db.clientes;

    if (metodo === "POST") {
        if (db.clientes.some(c => c.email.toLowerCase() === corpo.email.toLowerCase())) {
            throw new Error("Este e-mail já está cadastrado para outro cliente.");
        }
        const novoId = proximoId(db.clientes, "id_cliente");
        db.clientes.push({ id_cliente: novoId, nome: corpo.nome, email: corpo.email, telefone: corpo.telefone || "" });
        salvarBancoLocal(db);
        return { id_cliente: novoId, mensagem: "Cliente cadastrado!" };
    }

    if (metodo === "PUT") {
        if (db.clientes.some(c => c.email.toLowerCase() === corpo.email.toLowerCase() && c.id_cliente !== id)) {
            throw new Error("Este e-mail já pertence a outro cliente.");
        }
        const cliente = db.clientes.find(c => c.id_cliente === id);
        if (cliente) Object.assign(cliente, corpo);
        salvarBancoLocal(db);
        return { mensagem: "Cliente atualizado!" };
    }

    if (metodo === "DELETE") {
        if (db.pedidos.some(p => p.id_cliente === id)) {
            throw new Error("Não é possível excluir: este cliente possui pedidos registrados.");
        }
        db.clientes = db.clientes.filter(c => c.id_cliente !== id);
        salvarBancoLocal(db);
        return { mensagem: "Cliente removido!" };
    }

    return {};
}

function rotaLivros(db, metodo, id, corpo) {
    if (metodo === "GET") {
        return db.livros.map(livro => {
            const categoria = db.categorias.find(c => c.id_categoria === livro.id_categoria);
            return { ...livro, nome_categoria: categoria ? categoria.nome : "Sem Categoria" };
        }).reverse();
    }

    if (metodo === "POST") {
        const novoId = proximoId(db.livros, "id_livro");
        db.livros.push({ id_livro: novoId, ...corpo });
        salvarBancoLocal(db);
        return { id_livro: novoId, mensagem: "Livro adicionado!" };
    }

    if (metodo === "PUT") {
        const livro = db.livros.find(l => l.id_livro === id);
        if (livro) Object.assign(livro, corpo);
        salvarBancoLocal(db);
        return { mensagem: "Livro atualizado!" };
    }

    if (metodo === "DELETE") {
        if (db.pedidos.some(p => p.itens.some(i => i.id_livro === id))) {
            throw new Error("Não é possível excluir: este livro faz parte de um pedido registrado.");
        }
        db.livros = db.livros.filter(l => l.id_livro !== id);
        salvarBancoLocal(db);
        return { mensagem: "Livro removido!" };
    }

    return {};
}

function rotaPedidos(db, metodo, id, corpo) {
    if (metodo === "GET") {
        return db.pedidos.map(pedido => {
            const cliente = db.clientes.find(c => c.id_cliente === pedido.id_cliente);
            const itens = pedido.itens.map(item => {
                const livro = db.livros.find(l => l.id_livro === item.id_livro);
                return { ...item, titulo_livro: livro ? livro.titulo : `Livro #${item.id_livro}` };
            });
            return { ...pedido, nome_cliente: cliente ? cliente.nome : "Cliente", itens };
        }).reverse();
    }

    if (metodo === "POST") {
        const novoId = proximoId(db.pedidos, "id_pedido", 101);
        const total = corpo.itens.reduce((soma, item) => soma + item.quantidade * item.preco_unitario, 0);
        db.pedidos.push({
            id_pedido: novoId,
            data_pedido: dataDeHoje(),
            status: corpo.status || "Pendente",
            valor_total: total,
            id_cliente: corpo.id_cliente,
            itens: corpo.itens
        });
        salvarBancoLocal(db);
        return { id_pedido: novoId, mensagem: "Pedido registrado!" };
    }

    if (metodo === "PUT") {
        const pedido = db.pedidos.find(p => p.id_pedido === id);
        if (pedido) pedido.status = corpo.status;
        salvarBancoLocal(db);
        return { mensagem: "Status atualizado!" };
    }

    if (metodo === "DELETE") {
        db.pedidos = db.pedidos.filter(p => p.id_pedido !== id);
        salvarBancoLocal(db);
        return { mensagem: "Pedido excluído!" };
    }

    return {};
}
