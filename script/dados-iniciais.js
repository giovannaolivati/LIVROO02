// Dados iniciais do modo demonstração (localStorage).
// São os mesmos registros de back-end/banco.sql, para o site funcionar igual sem a API Flask.

const DADOS_INICIAIS = {
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
