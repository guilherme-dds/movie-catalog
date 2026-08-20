# CineHanks - Catálogo de Filmes

Aplicação web fullstack para exploração, avaliação e gerenciamento de filmes do ator Tom Hanks, utilizando dados integrados da API do TMDB (The Movie Database), autenticação JWT e persistência em banco de dados relacional. O projeto é utilizado na disciplina de Introdução à Computação em Nuvem, com deploy e gerenciamento dos serviços através do Portainer.

---

## Funcionalidades

- **Autenticação de Usuários**: Cadastro de conta e autenticação via Login com geração de tokens JWT seguros.
- **Catálogo de Filmes**: Integração com a API do TMDB para exibição dos filmes do Tom Hanks, incluindo poster, sinopse, nota e ano de lançamento.
- **Busca e Paginação**: Filtro em tempo real por título, título original, personagem ou ano, com paginação interativa.
- **Favoritos Personalizados**: Adição e remoção de filmes da lista de favoritos do usuário autenticado.
- **Sistema de Comentários**: Inclusão e exclusão de comentários em cada filme com sincronização no banco de dados.

---

## Tecnologias Utilizadas

### Frontend
- **React**
- **TypeScript**
- **Vite**

### Backend
- **Node.js**
- **Express 5**
- **TypeScript**
- **Prisma ORM 7**
- **JWT (JSON Web Token)**
- **Bcryptjs**

### Banco de Dados & Infraestrutura
- **MySQL**
- **Nginx** (Proxy Reverso)
- **Docker & Docker Compose**

---

## Estrutura do Projeto

```text
movie-catalog/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Modelagem de dados (Usuario, Favorito, Comentario)
│   ├── src/
│   │   ├── controller/        # Controladores das rotas de Auth, Usuário, Favorito e Comentário
│   │   ├── middlewares/       # Middleware de validação do token JWT
│   │   ├── utils/             # Utilitários de conexão Prisma
│   │   ├── routes.ts          # Definição dos endpoints Express
│   │   └── server.ts          # Inicialização do servidor HTTP
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/               # Chamadas para a API TMDB e API Backend
│   │   ├── components/        # Componentes de UI (MovieCard, Modal, Navbar, Auth, Toast)
│   │   ├── context/           # Contexto de Autenticação (AuthContext)
│   │   └── App.tsx            # Componente raiz da aplicação
│   └── Dockerfile
├── nginx/
│   ├── nginx.conf             # Configuração de proxy reverso (/api -> backend, / -> frontend)
│   └── Dockerfile
├── docker-compose.yml         # Orquestração dos contêineres
└── README.md
```

---

## Configuração de Variáveis de Ambiente

Antes de executar a aplicação, crie os arquivos de ambiente necessários com base nos exemplos abaixo:

### Backend (`backend/.env`)

```env
PORT=3333
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=senha_banco
DATABASE_NAME=movie_catalog
DATABASE_PORT=3306
DATABASE_URL="mysql://root:senha_banco@localhost:3306/movie_catalog"
JWT_SECRET=seu_jwt_secret_aqui
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8209/api
VITE_TMDB_API_KEY=sua_chave_api_tmdb_aqui
```

---

## Como Executar o Projeto

### Opção 1: Utilizando Docker Compose (Recomendado)

1. Certifique-se de ter o **Docker** e o **Docker Compose** instalados em sua máquina.
2. Certifique-se de configurar a variável `VITE_TMDB_API_KEY` no arquivo `frontend/.env` ou nas variáveis de ambiente.
3. No diretório raiz do projeto, execute o comando de build e inicialização dos serviços:

```bash
docker compose up --build
```

4. A aplicação estará acessível através do endereço do proxy Nginx:
   - **Frontend & API Unificados**: `http://localhost:8209`

---

### Opção 2: Execução Manual / Desenvolvimento Local

#### 1. Banco de Dados
Inicialize uma instância do MySQL ou MariaDB e crie o banco de dados especificado na variável `DATABASE_NAME`.

#### 2. Backend

Navegue até a pasta do backend, instale as dependências e aplique as migrações/schema do Prisma:

```bash
cd backend
npm install
npx prisma db push
npm run dev
```

O servidor backend iniciará na porta configurada (`http://localhost:3333`).

#### 3. Frontend

Em outro terminal, navegue até a pasta do frontend, instale as dependências e inicie o servidor de desenvolvimento Vite:

```bash
cd frontend
npm install
npm run dev
```

A aplicação frontend iniciará por padrão em `http://localhost:5173`.

---

## Endpoints da API Backend

### Autenticação e Usuários
- `POST /api/create`: Cadastra um novo usuário.
- `POST /api/auth`: Realiza login e retorna o token JWT.
- `GET /api/users`: Lista os usuários cadastrados (Requer autenticação JWT).

### Favoritos
- `GET /api/favorite`: Lista os filmes favoritos do usuário logado (Requer JWT).
- `POST /api/favorite`: Adiciona um filme aos favoritos do usuário (Requer JWT).
- `DELETE /api/favorite/:id`: Remove um filme dos favoritos pelo ID (Requer JWT).

### Comentários
- `GET /api/comment/:movieId`: Lista os comentários de um filme específico (Requer JWT).
- `POST /api/comment`: Adiciona um comentário em um filme (Requer JWT).
- `DELETE /api/comment/delete/:id`: Exclui um comentário pelo ID (Requer JWT).

---

## Autor

Desenvolvido por **Guilherme Dias** como parte da disciplina de Introdução à Computação em Nuvem, sob orientação do professor [@siriani](https://github.com/siriani).
