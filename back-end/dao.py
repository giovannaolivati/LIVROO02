import os
import sqlite3
from contextlib import closing, contextmanager
from models import Categoria, Cliente, Livro, Pedido, ItemPedido

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "livraria.db")
SQL_PATH = os.path.join(BASE_DIR, "banco.sql")


def inicializar_banco(caminho_banco=DEFAULT_DB_PATH, caminho_sql=SQL_PATH):
    """Cria as tabelas e os dados iniciais a partir do banco.sql, apenas se o banco ainda estiver vazio."""
    with closing(sqlite3.connect(caminho_banco)) as conexao:
        ja_existe = conexao.execute(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'categoria'"
        ).fetchone()
        if not ja_existe:
            with open(caminho_sql, encoding="utf-8") as arquivo:
                conexao.executescript(arquivo.read())


class BaseDAO:
    def __init__(self, caminho_banco=DEFAULT_DB_PATH):
        self.caminho_banco = caminho_banco

    @contextmanager
    def conectar(self):
        """Abre a conexão, confirma (commit) ao sair do bloco e desfaz (rollback) se der erro."""
        conexao = sqlite3.connect(self.caminho_banco)
        conexao.execute("PRAGMA foreign_keys = ON;")
        try:
            with conexao:
                yield conexao
        finally:
            conexao.close()


class CategoriaDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            linhas = conexao.execute(
                "SELECT id_categoria, nome FROM categoria ORDER BY id_categoria ASC"
            ).fetchall()
        return [Categoria(*linha) for linha in linhas]

    def inserir(self, categoria):
        with self.conectar() as conexao:
            cursor = conexao.execute("INSERT INTO categoria (nome) VALUES (?)", (categoria.nome,))
            return cursor.lastrowid

    def atualizar(self, categoria):
        with self.conectar() as conexao:
            conexao.execute(
                "UPDATE categoria SET nome=? WHERE id_categoria=?",
                (categoria.nome, categoria.id_categoria),
            )

    def remover(self, id_categoria):
        with self.conectar() as conexao:
            conexao.execute("DELETE FROM categoria WHERE id_categoria=?", (id_categoria,))


class ClienteDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            linhas = conexao.execute(
                "SELECT id_cliente, nome, email, telefone FROM cliente ORDER BY nome ASC"
            ).fetchall()
        return [Cliente(*linha) for linha in linhas]

    def inserir(self, cliente):
        with self.conectar() as conexao:
            cursor = conexao.execute(
                "INSERT INTO cliente (nome, email, telefone) VALUES (?, ?, ?)",
                (cliente.nome, cliente.email, cliente.telefone),
            )
            return cursor.lastrowid

    def atualizar(self, cliente):
        with self.conectar() as conexao:
            conexao.execute(
                "UPDATE cliente SET nome=?, email=?, telefone=? WHERE id_cliente=?",
                (cliente.nome, cliente.email, cliente.telefone, cliente.id_cliente),
            )

    def remover(self, id_cliente):
        with self.conectar() as conexao:
            conexao.execute("DELETE FROM cliente WHERE id_cliente=?", (id_cliente,))


class LivroDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            linhas = conexao.execute("""
                SELECT l.id_livro, l.titulo, l.autor, l.preco, l.ano_publicacao, l.id_categoria, c.nome
                FROM livro AS l INNER JOIN categoria AS c ON l.id_categoria = c.id_categoria
                ORDER BY l.id_livro DESC
            """).fetchall()
        return [Livro(*linha) for linha in linhas]

    def inserir(self, livro):
        with self.conectar() as conexao:
            cursor = conexao.execute(
                "INSERT INTO livro (titulo, autor, preco, ano_publicacao, id_categoria) VALUES (?, ?, ?, ?, ?)",
                (livro.titulo, livro.autor, livro.preco, livro.ano_publicacao, livro.id_categoria),
            )
            return cursor.lastrowid

    def atualizar(self, livro):
        with self.conectar() as conexao:
            conexao.execute(
                "UPDATE livro SET titulo=?, autor=?, preco=?, ano_publicacao=?, id_categoria=? WHERE id_livro=?",
                (livro.titulo, livro.autor, livro.preco, livro.ano_publicacao, livro.id_categoria, livro.id_livro),
            )

    def remover(self, id_livro):
        with self.conectar() as conexao:
            conexao.execute("DELETE FROM livro WHERE id_livro=?", (id_livro,))


class PedidoDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            linhas = conexao.execute("""
                SELECT p.id_pedido, p.data_pedido, p.status, p.valor_total, p.id_cliente, c.nome
                FROM pedido AS p INNER JOIN cliente AS c ON p.id_cliente = c.id_cliente
                ORDER BY p.id_pedido DESC
            """).fetchall()
            pedidos = []
            for id_pedido, data_pedido, status, valor_total, id_cliente, nome_cliente in linhas:
                linhas_itens = conexao.execute("""
                    SELECT ip.id_pedido, ip.id_livro, ip.quantidade, ip.preco_unitario, l.titulo
                    FROM item_pedido AS ip INNER JOIN livro AS l ON ip.id_livro = l.id_livro
                    WHERE ip.id_pedido = ?
                """, (id_pedido,)).fetchall()
                itens = [ItemPedido(*linha) for linha in linhas_itens]
                pedidos.append(Pedido(id_pedido, data_pedido, status, valor_total, id_cliente, nome_cliente, itens))
        return pedidos

    def inserir(self, pedido):
        with self.conectar() as conexao:
            cursor = conexao.execute(
                "INSERT INTO pedido (data_pedido, status, valor_total, id_cliente) VALUES (?, ?, ?, ?)",
                (pedido.data_pedido, pedido.status, pedido.valor_total, pedido.id_cliente),
            )
            id_pedido = cursor.lastrowid
            conexao.executemany(
                "INSERT INTO item_pedido (id_pedido, id_livro, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
                [(id_pedido, i.id_livro, i.quantidade, i.preco_unitario) for i in pedido.itens],
            )
            return id_pedido

    def atualizar_status(self, id_pedido, status):
        with self.conectar() as conexao:
            conexao.execute("UPDATE pedido SET status=? WHERE id_pedido=?", (status, id_pedido))

    def remover(self, id_pedido):
        with self.conectar() as conexao:
            conexao.execute("DELETE FROM pedido WHERE id_pedido=?", (id_pedido,))
