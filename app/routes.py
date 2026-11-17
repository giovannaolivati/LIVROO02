import sqlite3
from datetime import date
from flask import Blueprint, request, jsonify, render_template
from .models import Categoria, Cliente, Livro, Pedido, ItemPedido
from .dao import CategoriaDAO, ClienteDAO, LivroDAO, PedidoDAO

bp = Blueprint("main", __name__)

categoria_dao = CategoriaDAO()
cliente_dao = ClienteDAO()
livro_dao = LivroDAO()
pedido_dao = PedidoDAO()


# --- Rotas para servir o front-end localmente via http://127.0.0.1:5000 ---
@bp.route("/", methods=["GET"])
def servir_index():
    return render_template("index.html")


# --- API REST: CATEGORIAS ---
@bp.route("/api/categorias", methods=["GET"])
def listar_categorias():
    return jsonify([c.to_dict() for c in categoria_dao.buscar_todos()])


@bp.route("/api/categorias", methods=["POST"])
def criar_categoria():
    dados = request.get_json(silent=True) or {}
    nome = (dados.get("nome") or "").strip()
    if len(nome) < 2:
        return jsonify({"erro": "Informe um nome válido para a categoria."}), 400
    id_gerado = categoria_dao.inserir(Categoria(None, nome))
    return jsonify({"id_categoria": id_gerado, "mensagem": "Categoria cadastrada!"}), 201


@bp.route("/api/categorias/<int:id_categoria>", methods=["PUT"])
def atualizar_categoria(id_categoria):
    dados = request.get_json(silent=True) or {}
    nome = (dados.get("nome") or "").strip()
    if len(nome) < 2:
        return jsonify({"erro": "Informe um nome válido para a categoria."}), 400
    categoria_dao.atualizar(Categoria(id_categoria, nome))
    return jsonify({"mensagem": "Categoria atualizada!"})


@bp.route("/api/categorias/<int:id_categoria>", methods=["DELETE"])
def remover_categoria(id_categoria):
    try:
        categoria_dao.remover(id_categoria)
        return jsonify({"mensagem": "Categoria removida!"})
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Não é possível excluir: existem livros vinculados a esta categoria."}), 400


# --- API REST: CLIENTES ---
@bp.route("/api/clientes", methods=["GET"])
def listar_clientes():
    return jsonify([c.to_dict() for c in cliente_dao.buscar_todos()])


@bp.route("/api/clientes", methods=["POST"])
def criar_cliente():
    dados = request.get_json(silent=True) or {}
    nome = (dados.get("nome") or "").strip()
    email = (dados.get("email") or "").strip()
    telefone = (dados.get("telefone") or "").strip()
    if len(nome) < 3 or "@" not in email:
        return jsonify({"erro": "Informe nome e e-mail válidos para o cliente."}), 400
    try:
        id_gerado = cliente_dao.inserir(Cliente(None, nome, email, telefone))
        return jsonify({"id_cliente": id_gerado, "mensagem": "Cliente cadastrado!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Este e-mail já está cadastrado para outro cliente."}), 400


@bp.route("/api/clientes/<int:id_cliente>", methods=["PUT"])
def atualizar_cliente(id_cliente):
    dados = request.get_json(silent=True) or {}
    nome = (dados.get("nome") or "").strip()
    email = (dados.get("email") or "").strip()
    telefone = (dados.get("telefone") or "").strip()
    if len(nome) < 3 or "@" not in email:
        return jsonify({"erro": "Informe nome e e-mail válidos para o cliente."}), 400
    try:
        cliente_dao.atualizar(Cliente(id_cliente, nome, email, telefone))
        return jsonify({"mensagem": "Cliente atualizado!"})
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Este e-mail já pertence a outro cliente."}), 400


@bp.route("/api/clientes/<int:id_cliente>", methods=["DELETE"])
def remover_cliente(id_cliente):
    try:
        cliente_dao.remover(id_cliente)
        return jsonify({"mensagem": "Cliente removido!"})
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Não é possível excluir: este cliente possui pedidos registrados."}), 400


# --- API REST: LIVROS ---
@bp.route("/api/livros", methods=["GET"])
def listar_livros():
    return jsonify([l.to_dict() for l in livro_dao.buscar_todos()])


@bp.route("/api/livros", methods=["POST"])
def criar_livro():
    dados = request.get_json(silent=True) or {}
    try:
        titulo = (dados["titulo"] or "").strip()
        autor = (dados["autor"] or "").strip()
        preco = float(dados["preco"])
        ano = int(dados["ano_publicacao"])
        id_cat = int(dados["id_categoria"])
        if len(titulo) < 2 or len(autor) < 2 or preco <= 0:
            return jsonify({"erro": "Verifique os dados do livro informado."}), 400
        id_gerado = livro_dao.inserir(Livro(None, titulo, autor, preco, ano, id_cat))
        return jsonify({"id_livro": id_gerado, "mensagem": "Livro adicionado!"}), 201
    except (KeyError, TypeError, ValueError, sqlite3.IntegrityError):
        return jsonify({"erro": "Dados inválidos ou categoria inexistente."}), 400


@bp.route("/api/livros/<int:id_livro>", methods=["PUT"])
def atualizar_livro(id_livro):
    dados = request.get_json(silent=True) or {}
    try:
        titulo = (dados["titulo"] or "").strip()
        autor = (dados["autor"] or "").strip()
        preco = float(dados["preco"])
        ano = int(dados["ano_publicacao"])
        id_cat = int(dados["id_categoria"])
        if len(titulo) < 2 or len(autor) < 2 or preco <= 0:
            return jsonify({"erro": "Verifique os dados do livro informado."}), 400
        livro_dao.atualizar(Livro(id_livro, titulo, autor, preco, ano, id_cat))
        return jsonify({"mensagem": "Livro atualizado!"})
    except (KeyError, TypeError, ValueError, sqlite3.IntegrityError):
        return jsonify({"erro": "Dados inválidos ou categoria inexistente."}), 400


@bp.route("/api/livros/<int:id_livro>", methods=["DELETE"])
def remover_livro(id_livro):
    try:
        livro_dao.remover(id_livro)
        return jsonify({"mensagem": "Livro removido!"})
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Não é possível excluir: este livro faz parte de um pedido registrado."}), 400


# --- API REST: PEDIDOS ---
@bp.route("/api/pedidos", methods=["GET"])
def listar_pedidos():
    return jsonify([p.to_dict() for p in pedido_dao.buscar_todos()])


@bp.route("/api/pedidos", methods=["POST"])
def criar_pedido():
    dados = request.get_json(silent=True) or {}
    itens_raw = dados.get("itens", [])
    if not itens_raw:
        return jsonify({"erro": "Adicione pelo menos um livro ao pedido."}), 400
    try:
        itens_obj = [
            ItemPedido(None, int(i["id_livro"]), int(i["quantidade"]), float(i["preco_unitario"]))
            for i in itens_raw
        ]
        valor_total = sum(i.quantidade * i.preco_unitario for i in itens_obj)
        novo = Pedido(
            None,
            dados.get("data_pedido") or date.today().isoformat(),
            dados.get("status", "Pendente"),
            valor_total,
            int(dados["id_cliente"]),
            itens=itens_obj,
        )
        id_gerado = pedido_dao.inserir(novo)
        return jsonify({"id_pedido": id_gerado, "mensagem": "Pedido registrado!"}), 201
    except (KeyError, TypeError, ValueError, sqlite3.IntegrityError):
        return jsonify({"erro": "Não foi possível registrar o pedido. Verifique cliente e livros."}), 400


@bp.route("/api/pedidos/<int:id_pedido>", methods=["PUT"])
def atualizar_pedido(id_pedido):
    dados = request.get_json(silent=True) or {}
    status = (dados.get("status") or "").strip()
    if status not in ("Pendente", "Preparando", "Entregue"):
        return jsonify({"erro": "Status inválido."}), 400
    pedido_dao.atualizar_status(id_pedido, status)
    return jsonify({"mensagem": "Status atualizado!"})


@bp.route("/api/pedidos/<int:id_pedido>", methods=["DELETE"])
def remover_pedido(id_pedido):
    pedido_dao.remover(id_pedido)
    return jsonify({"mensagem": "Pedido excluído!"})
