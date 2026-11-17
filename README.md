# The Greenwich Corner Books — Projeto Integrador (DWS • POO • BD)

Sistema web completo de gerenciamento de uma livraria em Greenwich Village, Nova York, desenvolvido para o **Projeto Integrador do 2º Ano do Curso Técnico em Informática (UNASP-HT)**.

## Estrutura de Pastas do Projeto

```text
the-greenwich-corner-books/
├── index.html                          # Página principal autossuficiente (HTML + CSS + JS embutidos para GitHub Pages)
├── .nojekyll                           # Desativa o processamento Jekyll no GitHub Pages
├── .gitignore                          # Ignora caches Python e arquivos temporários
├── README.md                           # Documentação do projeto e guia de execução
├── css/
│   └── style.css                       # Folha de estilos temática (New York Bookshop)
├── js/
│   └── script.js                       # Lógica CRUD assíncrona (Fetch API + fallback LocalStorage)
├── backend/
│   ├── app.py                          # Servidor web e API REST em Python (Flask + CORS)
│   ├── dao.py                          # Camada de persistência DAO (SQLite com chaves estrangeiras)
│   ├── models.py                       # Classes de domínio POO (Categoria, Cliente, Livro, Pedido, ItemPedido)
│   └── requirements.txt                # Dependências Python (Flask e flask-cors)
└── database/
    ├── banco.sql                       # Script DDL (CREATE TABLE) e DML (INSERT inicial)
    ├── consultas_integradoras.sql      # Consultas SQL (INNER JOIN, LEFT JOIN, Subqueries, NOT EXISTS, Paginação)
    └── brmodelo_logico.txt             # Esquema lógico relacional (PKs, FKs e cardinalidades)
```

## Como Publicar no GitHub Pages

1. Extraia este arquivo `.zip` no seu computador e abra a pasta extraída até visualizar os arquivos (`index.html`, `.nojekyll`, `.gitignore`, `README.md`, `css/`, `js/`, `backend/`, `database/`).
2. No seu repositório no GitHub (ex.: `LIVROO`), clique em **Add file → Upload files**.
3. Selecione **todos os arquivos e pastas de dentro da pasta extraída** (`Ctrl + A`), arraste para a janela de upload e clique em **Commit changes** *(não envie o `.zip` fechado nem a pasta pai fechada)*.
4. Vá em **Settings → Pages**, em **Branch** selecione `main` e a pasta `/ (root)`, e clique em **Save**.
5. Aguarde cerca de 1 minuto e acesse o link gerado pelo GitHub Pages. O sistema funciona imediatamente no navegador com persistência local (`LocalStorage`).

## Como Executar Localmente com Python (Flask + SQLite)

1. Instale as dependências:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. Inicie o servidor Flask (cria e popula `database/livraria.db` automaticamente):
   ```bash
   python app.py
   ```
3. Acesse `http://127.0.0.1:5000` no navegador (ou abra `index.html`). O badge superior indicará **API REST Flask + SQLite Conectada**.
