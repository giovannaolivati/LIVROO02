import os
import sqlite3
from models import Categoria, Cliente, Livro, Pedido, ItemPedido

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "..", "database", "livraria.db")


class BaseDAO:
    def __init__(self, caminho_banco=DEFAULT_DB_PATH):
        self.caminho_banco = caminho_banco

    def conectar(self):
        conexao = sqlite3.connect(self.caminho_banco)
        conexao.execute("PRAGMA foreign_keys = ON;")
        return conexao


def inicializar_banco(caminho_banco=DEFAULT_DB_PATH):
    os.makedirs(os.path.dirname(os.path.abspath(caminho_banco)), exist_ok=True)
    with sqlite3.connect(caminho_banco) as conexao:
        conexao.execute("PRAGMA foreign_keys = ON;")
        cursor = conexao.cursor()
        cursor.executescript("""
        CREATE TABLE IF NOT EXISTS categoria (
            id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(80) NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cliente (
            id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            telefone VARCHAR(20)
        );
        CREATE TABLE IF NOT EXISTS livro (
            id_livro INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo VARCHAR(150) NOT NULL,
            autor VARCHAR(100) NOT NULL,
            preco DECIMAL(10, 2) NOT NULL,
            ano_publicacao INTEGER NOT NULL,
            id_categoria INTEGER NOT NULL,
            FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
        );
        CREATE TABLE IF NOT EXISTS pedido (
            id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
            data_pedido DATE NOT NULL,
            status VARCHAR(50) NOT NULL,
            valor_total DECIMAL(10, 2) NOT NULL,
            id_cliente INTEGER NOT NULL,
            FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        );
        CREATE TABLE IF NOT EXISTS item_pedido (
            id_pedido INTEGER NOT NULL,
            id_livro INTEGER NOT NULL,
            quantidade INTEGER NOT NULL,
            preco_unitario DECIMAL(10, 2) NOT NULL,
            PRIMARY KEY (id_pedido, id_livro),
            FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
            FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
        );
        """)
        cursor.execute("SELECT COUNT(*) FROM categoria")
        if cursor.fetchone()[0] == 0:
            cursor.executemany("INSERT INTO categoria (id_categoria, nome) VALUES (?, ?)", [
                (1, "Clássicos Americanos"), (2, "Ficção Contemporânea"),
                (3, "Poesia & Ensaios"), (4, "Mistério & Noir"), (5, "Artes & Arquitetura")
            ])
            cursor.executemany("INSERT INTO cliente (id_cliente, nome, email, telefone) VALUES (?, ?, ?, ?)", [
                (1, "Clara Oswald", "clara.oswald@nycmail.com", "(212) 555-0142"),
                (2, "Arthur Pendelton", "arthur.p@villagebooks.com", "(212) 555-0198"),
                (3, "Maya Lin", "maya.lin@brooklyn.org", "(718) 555-0174"),
                (4, "Julian Vance", "julian.vance@soho.net", "(646) 555-0119")
            ])
            cursor.executemany("INSERT INTO livro (id_livro, titulo, autor, preco, ano_publicacao, id_categoria) VALUES (?, ?, ?, ?, ?, ?)", [
                (1, "O Grande Gatsby", "F. Scott Fitzgerald", 48.90, 1925, 1),
                (2, "O Apanhador no Campo de Centeio", "J. D. Salinger", 54.00, 1951, 1),
                (3, "A Redoma de Vidro", "Sylvia Plath", 46.50, 1963, 3),
                (4, "Trilogia de Nova York", "Paul Auster", 62.00, 1987, 4),
                (5, "Só Garotos", "Patti Smith", 59.90, 2010, 2),
                (6, "O Sol é para Todos", "Harper Lee", 52.00, 1960, 1)
            ])
            cursor.executemany("INSERT INTO pedido (id_pedido, data_pedido, status, valor_total, id_cliente) VALUES (?, ?, ?, ?, ?)", [
                (101, "2026-11-05", "Entregue", 102.90, 1),
                (102, "2026-11-10", "Preparando", 121.90, 2),
                (103, "2026-11-12", "Pendente", 93.00, 3)
            ])
            cursor.executemany("INSERT INTO item_pedido (id_pedido, id_livro, quantidade, preco_unitario) VALUES (?, ?, ?, ?)", [
                (101, 1, 1, 48.90), (101, 2, 1, 54.00),
                (102, 4, 1, 62.00), (102, 5, 1, 59.90), (103, 3, 2, 46.50)
            ])
        conexao.commit()


class CategoriaDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("SELECT id_categoria, nome FROM categoria ORDER BY id_categoria ASC")
            return [Categoria(*linha) for linha in cursor.fetchall()]

    def inserir(self, categoria):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("INSERT INTO categoria (nome) VALUES (?)", (categoria.nome,))
            conexao.commit()
            return cursor.lastrowid

    def atualizar(self, categoria):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("UPDATE categoria SET nome=? WHERE id_categoria=?", (categoria.nome, categoria.id_categoria))
            conexao.commit()

    def remover(self, id_categoria):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("DELETE FROM categoria WHERE id_categoria=?", (id_categoria,))
            conexao.commit()


class ClienteDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("SELECT id_cliente, nome, email, telefone FROM cliente ORDER BY nome ASC")
            return [Cliente(*linha) for linha in cursor.fetchall()]

    def inserir(self, cliente):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("INSERT INTO cliente (nome, email, telefone) VALUES (?, ?, ?)", (cliente.nome, cliente.email, cliente.telefone))
            conexao.commit()
            return cursor.lastrowid

    def atualizar(self, cliente):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("UPDATE cliente SET nome=?, email=?, telefone=? WHERE id_cliente=?", (cliente.nome, cliente.email, cliente.telefone, cliente.id_cliente))
            conexao.commit()

    def remover(self, id_cliente):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("DELETE FROM cliente WHERE id_cliente=?", (id_cliente,))
            conexao.commit()


class LivroDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                SELECT l.id_livro, l.titulo, l.autor, l.preco, l.ano_publicacao, l.id_categoria, c.nome
                FROM livro AS l INNER JOIN categoria AS c ON l.id_categoria = c.id_categoria
                ORDER BY l.id_livro DESC
            """)
            return [Livro(*linha) for linha in cursor.fetchall()]

    def inserir(self, livro):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("INSERT INTO livro (titulo, autor, preco, ano_publicacao, id_categoria) VALUES (?, ?, ?, ?, ?)",
                           (livro.titulo, livro.autor, livro.preco, livro.ano_publicacao, livro.id_categoria))
            conexao.commit()
            return cursor.lastrowid

    def atualizar(self, livro):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("UPDATE livro SET titulo=?, autor=?, preco=?, ano_publicacao=?, id_categoria=? WHERE id_livro=?",
                           (livro.titulo, livro.autor, livro.preco, livro.ano_publicacao, livro.id_categoria, livro.id_livro))
            conexao.commit()

    def remover(self, id_livro):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("DELETE FROM livro WHERE id_livro=?", (id_livro,))
            conexao.commit()


class PedidoDAO(BaseDAO):
    def buscar_todos(self):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                SELECT p.id_pedido, p.data_pedido, p.status, p.valor_total, p.id_cliente, c.nome
                FROM pedido AS p INNER JOIN cliente AS c ON p.id_cliente = c.id_cliente
                ORDER BY p.id_pedido DESC
            """)
            pedidos = []
            for row in cursor.fetchall():
                cursor.execute("""
                    SELECT ip.id_pedido, ip.id_livro, ip.quantidade, ip.preco_unitario, l.titulo
                    FROM item_pedido AS ip INNER JOIN livro AS l ON ip.id_livro = l.id_livro
                    WHERE ip.id_pedido = ?
                """, (row[0],))
                itens = [ItemPedido(*item_row) for item_row in cursor.fetchall()]
                pedidos.append(Pedido(row[0], row[1], row[2], row[3], row[4], row[5], itens))
            return pedidos

    def inserir(self, pedido):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("INSERT INTO pedido (data_pedido, status, valor_total, id_cliente) VALUES (?, ?, ?, ?)",
                           (pedido.data_pedido, pedido.status, pedido.valor_total, pedido.id_cliente))
            id_pedido = cursor.lastrowid
            for item in pedido.itens:
                cursor.execute("INSERT INTO item_pedido (id_pedido, id_livro, quantidade, preco_unitario) VALUES (?, ?, ?, ?)",
                               (id_pedido, item.id_livro, item.quantidade, item.preco_unitario))
            conexao.commit()
            return id_pedido

    def atualizar_status(self, id_pedido, status):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("UPDATE pedido SET status=? WHERE id_pedido=?", (status, id_pedido))
            conexao.commit()

    def remover(self, id_pedido):
        with self.conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("DELETE FROM pedido WHERE id_pedido=?", (id_pedido,))
            conexao.commit()
