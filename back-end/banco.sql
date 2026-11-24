-- The Greenwich Corner Books - banco de dados (SQLite)
-- Cria as tabelas e os dados iniciais. O dao.py executa este arquivo
-- sozinho quando o livraria.db ainda não existe.
-- Atenção: os DROP TABLE abaixo apagam os dados se você rodar o arquivo à mão.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS item_pedido;
DROP TABLE IF EXISTS pedido;
DROP TABLE IF EXISTS livro;
DROP TABLE IF EXISTS cliente;
DROP TABLE IF EXISTS categoria;

CREATE TABLE categoria (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(80) NOT NULL
);

CREATE TABLE cliente (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20)
);

CREATE TABLE livro (
    id_livro INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(150) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    preco DECIMAL(10, 2) NOT NULL,
    ano_publicacao INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE pedido (
    id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    data_pedido DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    id_cliente INTEGER NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE item_pedido (
    id_pedido INTEGER NOT NULL,
    id_livro INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id_pedido, id_livro),
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_livro) REFERENCES livro(id_livro)
);

INSERT INTO categoria (id_categoria, nome) VALUES
(1, 'Clássicos Americanos'),
(2, 'Ficção Contemporânea'),
(3, 'Poesia & Ensaios'),
(4, 'Mistério & Noir'),
(5, 'Artes & Arquitetura');

INSERT INTO cliente (id_cliente, nome, email, telefone) VALUES
(1, 'Clara Oswald', 'clara.oswald@nycmail.com', '(212) 555-0142'),
(2, 'Arthur Pendelton', 'arthur.p@villagebooks.com', '(212) 555-0198'),
(3, 'Maya Lin', 'maya.lin@brooklyn.org', '(718) 555-0174'),
(4, 'Julian Vance', 'julian.vance@soho.net', '(646) 555-0119');

INSERT INTO livro (id_livro, titulo, autor, preco, ano_publicacao, id_categoria) VALUES
(1, 'O Grande Gatsby', 'F. Scott Fitzgerald', 48.90, 1925, 1),
(2, 'O Apanhador no Campo de Centeio', 'J. D. Salinger', 54.00, 1951, 1),
(3, 'A Redoma de Vidro', 'Sylvia Plath', 46.50, 1963, 3),
(4, 'Trilogia de Nova York', 'Paul Auster', 62.00, 1987, 4),
(5, 'Só Garotos', 'Patti Smith', 59.90, 2010, 2),
(6, 'O Sol é para Todos', 'Harper Lee', 52.00, 1960, 1);

INSERT INTO pedido (id_pedido, data_pedido, status, valor_total, id_cliente) VALUES
(101, '2026-11-05', 'Entregue', 102.90, 1),
(102, '2026-11-10', 'Preparando', 121.90, 2),
(103, '2026-11-12', 'Pendente', 93.00, 3);

INSERT INTO item_pedido (id_pedido, id_livro, quantidade, preco_unitario) VALUES
(101, 1, 1, 48.90),
(101, 2, 1, 54.00),
(102, 4, 1, 62.00),
(102, 5, 1, 59.90),
(103, 3, 2, 46.50);
