# Gestão de Cobrança

## Requisitos
- Python 3.13
- Node.js (recomendado 18+)
- npm ou yarn

## Instalação do Backend (API Flask)
1. Acesse a pasta do projeto:
   ```powershell
   cd src/server
   ```
2. Instale as dependências Python:
   ```powershell
   pip install -r ../../requirements.txt
   ```
3. Execute o backend:
   ```powershell
   python app.py
   ```

## Instalação do Frontend (React + Vite)
1. Volte para a raiz do projeto:
   ```powershell
   cd ../..
   ```
2. Instale as dependências do frontend:
   ```powershell
   npm install
   ```
3. Execute o frontend:
   ```powershell
   npm run dev
   ```

## Banco de Dados
- O banco de dados SQLite será criado automaticamente como `instance/site.db` ao rodar o backend pela primeira vez.
- Usuários de exemplo são criados automaticamente: `teste_user` (senha: senha_teste).

## Observações
- Para acessar as rotas protegidas, é necessário autenticação via JWT.
- Para desenvolvimento, CORS está liberado



