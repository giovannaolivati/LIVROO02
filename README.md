# The Greenwich Corner Books — Projeto Integrador (DWS • POO • BD)

Sistema web completo de gerenciamento de uma livraria em Greenwich Village, Nova York, desenvolvido para o **Projeto Integrador do 2º Ano do Curso Técnico em Informática (UNASP-HT)**.

## Estrutura de Pastas do Projeto

```text
.
├── run.py                          # Ponto de entrada (python run.py)
├── requirements.txt                # Dependências (Flask e flask-cors)
├── app/                            # Aplicação Flask
│   ├── __init__.py                 # create_app() e configuração
│   ├── routes.py                   # Rotas e API REST
│   ├── models.py                   # Classes de domínio (POO)
│   ├── dao.py                      # Persistência (SQLite)
│   ├── templates/index.html        # Página principal
│   └── static/
│       ├── css/style.css
│       └── js/script.js
├── database/
│   ├── banco.sql                   # DDL e DML inicial
│   └── consultas_integradoras.sql  # Consultas SQL
├── arquivos/                       # Pacote .zip do projeto
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
   pip install -r requirements.txt
   ```
2. Inicie o servidor Flask (cria e popula `database/livraria.db` automaticamente):
   ```bash
   python run.py
   ```
3. Acesse `http://127.0.0.1:5000` no navegador . O badge superior indicará **API REST Flask + SQLite Conectada**.
