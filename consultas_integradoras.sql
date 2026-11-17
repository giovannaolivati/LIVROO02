-- 1. INNER JOIN: Listar livros com o nome da categoria
SELECT l.id_livro, l.titulo, l.autor, l.preco, c.nome AS categoria
FROM livro AS l
INNER JOIN categoria AS c ON l.id_categoria = c.id_categoria
ORDER BY l.titulo ASC;

-- 2. LEFT JOIN + IS NULL: Clientes sem pedidos
SELECT c.id_cliente, c.nome, c.email
FROM cliente AS c
LEFT JOIN pedido AS p ON c.id_cliente = p.id_cliente
WHERE p.id_pedido IS NULL;

-- 3. LEFT JOIN + IS NULL: Categorias sem livros
SELECT cat.id_categoria, cat.nome
FROM categoria AS cat
LEFT JOIN livro AS l ON cat.id_categoria = l.id_categoria
WHERE l.id_livro IS NULL;

-- 4. JOIN COM 4 TABELAS: Histórico completo de pedidos
SELECT c.nome AS cliente, p.id_pedido, p.data_pedido, p.status, l.titulo AS livro, ip.quantidade, ip.preco_unitario
FROM cliente AS c
INNER JOIN pedido AS p ON c.id_cliente = p.id_cliente
INNER JOIN item_pedido AS ip ON p.id_pedido = ip.id_pedido
INNER JOIN livro AS l ON ip.id_livro = l.id_livro
ORDER BY p.id_pedido DESC, l.titulo ASC;

-- 5. SUBQUERY DE VALOR ÚNICO (AVG): Livros acima da média de preço
SELECT titulo, autor, preco
FROM livro
WHERE preco > (SELECT AVG(preco) FROM livro)
ORDER BY preco DESC;

-- 6. NOT EXISTS: Livros nunca vendidos
SELECT l.id_livro, l.titulo, l.autor
FROM livro AS l
WHERE NOT EXISTS (
    SELECT 1 FROM item_pedido AS ip WHERE ip.id_livro = l.id_livro
);

-- 7. PAGINAÇÃO (ORDER BY + LIMIT + OFFSET): Página 2 (3 por página)
SELECT id_livro, titulo, autor, preco
FROM livro
ORDER BY titulo ASC, id_livro ASC
LIMIT 3 OFFSET 3;
