# Testes Funcionais (Selenium)

Este diretório contém os testes funcionais de UI com Selenium, executando o fluxo real entre o Front-end (Vite/React) e o Back-end (Flask).

## Pré‑requisitos
- Python com o ambiente virtual do projeto ativo.
- Dependências do `requirements.txt` instaladas.
- Back-end Flask rodando em `http://127.0.0.1:5000`.
- Front-end Vite rodando em `http://localhost:8080`.

## Variáveis de ambiente úteis
- `FRONTEND_URL` (opcional) para customizar a URL do front-end.
- `BACKEND_URL` (opcional) para customizar a URL da API.
- `SELENIUM_HEADLESS` ("1" por padrão). Use `0` para ver o navegador.

## Como executar (PowerShell no Windows)
Na raiz do projeto:

```powershell
# Headless (padrão)
python -m pytest tests/functional -v

# Em modo visível (não headless)
$env:SELENIUM_HEADLESS = "0" 
python -m pytest tests/functional -v

# Sobrescrevendo URLs, se necessário
$env:FRONTEND_URL = "http://localhost:8080"; $env:BACKEND_URL = "http://127.0.0.1:5000" 
python -m pytest tests/functional -v

# Executar um único teste (ex.: fluxo de registro de ação)
$env:SELENIUM_HEADLESS = "0" 
python -m pytest tests/functional/test_ui_flows.py::test_registrar_acao_contrato_parcela -v
```

## Cenários cobertos
- Login com sucesso (navega para Dashboard).
- Login inválido (exibe toast de erro).
- Cadastro de novo usuário e login em seguida.
 - Registro de ação para contrato/parcela específicos:
	 - Dashboard: busca por CPF de seed (123.456.789-01) e avança.
	 - Contracts: seleciona contrato 123456789, escolhe "Parcela 1" e clica em "Registrar Ação".
	 - ActionHistory: escolhe "Promessa de pagamento", adiciona comentário e continua.
	 - ActionConfirmation: confirma o registro e retorna ao Dashboard.

