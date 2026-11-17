# The Greenwich Corner Books — Projeto Integrador (DWS • POO • BD)

Sistema web completo de gerenciamento de uma livraria em Greenwich Village, Nova York, desenvolvido para o **Projeto Integrador do 2º Ano do Curso Técnico em Informática (UNASP-HT)**.

## Estrutura de Pastas do Projeto

```text
.
├── index.html                      # Entrada do GitHub Pages (redireciona para templates/index.html)
├── backend/
│   ├── app.py                      # Servidor Flask + API REST
│   ├── models.py                   # Classes de domínio (POO)
│   ├── dao.py                      # Persistência (SQLite)
│   └── requirements.txt            # Dependências (Flask e flask-cors)
├── templates/
│   └── index.html                  # Página principal
├── static/
│   ├── css/style.css
│   └── js/script.js
├── schemas/
│   ├── banco.sql                   # DDL e DML inicial
│   └── consultas_integradoras.sql  # Consultas SQL (o livraria.db é gerado aqui)
├── docs/                           # Pacote .zip e documentação
├── .github/workflows/static.yml    # Deploy no GitHub Pages
├── .nojekyll
├── .gitignore
└── README.md
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
2. Inicie o servidor Flask (cria e popula `schemas/livraria.db` automaticamente):
   ```bash
   python app.py
   ```
3. Acesse `http://127.0.0.1:5000` no navegador . O badge superior indicará **API REST Flask + SQLite Conectada**.
