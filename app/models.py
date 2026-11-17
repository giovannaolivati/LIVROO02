class Categoria:
    def __init__(self, id_categoria, nome):
        self.id_categoria = id_categoria
        self.nome = nome

    def to_dict(self):
        return {"id_categoria": self.id_categoria, "nome": self.nome}

    @classmethod
    def from_dict(cls, dados):
        return cls(dados.get("id_categoria"), dados["nome"])


class Cliente:
    def __init__(self, id_cliente, nome, email, telefone=""):
        self.id_cliente = id_cliente
        self.nome = nome
        self.email = email
        self.telefone = telefone

    def to_dict(self):
        return {"id_cliente": self.id_cliente, "nome": self.nome, "email": self.email, "telefone": self.telefone}

    @classmethod
    def from_dict(cls, dados):
        return cls(dados.get("id_cliente"), dados["nome"], dados["email"], dados.get("telefone", ""))


class Livro:
    def __init__(self, id_livro, titulo, autor, preco, ano_publicacao, id_categoria, nome_categoria=None):
        self.id_livro = id_livro
        self.titulo = titulo
        self.autor = autor
        self.preco = float(preco)
        self.ano_publicacao = int(ano_publicacao)
        self.id_categoria = int(id_categoria)
        self.nome_categoria = nome_categoria

    def to_dict(self):
        return {
            "id_livro": self.id_livro,
            "titulo": self.titulo,
            "autor": self.autor,
            "preco": self.preco,
            "ano_publicacao": self.ano_publicacao,
            "id_categoria": self.id_categoria,
            "nome_categoria": self.nome_categoria
        }


class ItemPedido:
    def __init__(self, id_pedido, id_livro, quantidade, preco_unitario, titulo_livro=None):
        self.id_pedido = id_pedido
        self.id_livro = int(id_livro)
        self.quantidade = int(quantidade)
        self.preco_unitario = float(preco_unitario)
        self.titulo_livro = titulo_livro

    def to_dict(self):
        return {
            "id_pedido": self.id_pedido,
            "id_livro": self.id_livro,
            "quantidade": self.quantidade,
            "preco_unitario": self.preco_unitario,
            "titulo_livro": self.titulo_livro
        }


class Pedido:
    def __init__(self, id_pedido, data_pedido, status, valor_total, id_cliente, nome_cliente=None, itens=None):
        self.id_pedido = id_pedido
        self.data_pedido = data_pedido
        self.status = status
        self.valor_total = float(valor_total)
        self.id_cliente = int(id_cliente)
        self.nome_cliente = nome_cliente
        self.itens = itens or []

    def to_dict(self):
        return {
            "id_pedido": self.id_pedido,
            "data_pedido": self.data_pedido,
            "status": self.status,
            "valor_total": self.valor_total,
            "id_cliente": self.id_cliente,
            "nome_cliente": self.nome_cliente,
            "itens": [item.to_dict() if hasattr(item, "to_dict") else item for item in self.itens]
        }
