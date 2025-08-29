import os
import time
from typing import Iterator

import pytest
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager


def _is_truthy(value: str | None) -> bool:
    return str(value).strip() in {"1", "true", "True", "yes", "on"}


@pytest.fixture(scope="session")
def base_urls() -> dict:
    """Resolve as URLs base do frontend e do backend (com sobrescritas por variáveis de ambiente)."""
    return {
    "frontend": os.environ.get("FRONTEND_URL", "http://localhost:8080"),
        "backend": os.environ.get("BACKEND_URL", "http://localhost:5000"),
    }


def _wait_http(url: str, timeout: float = 60.0, expect_status: int | None = None) -> None:
    """Faz polling de um endpoint HTTP até ficar acessível ou estourar o timeout."""
    start = time.time()
    last_err: Exception | None = None
    while time.time() - start < timeout:
        try:
            resp = requests.get(url, timeout=5)
            if expect_status is None:
                if resp.status_code < 500:
                    return
            else:
                if resp.status_code == expect_status:
                    return
        except Exception as e:  # noqa: BLE001
            last_err = e
        time.sleep(0.5)
    if last_err:
        raise RuntimeError(f"Timed out waiting for {url}: {last_err}")
    raise RuntimeError(f"Timed out waiting for {url}")


@pytest.fixture(scope="session")
def ensure_servers(base_urls: dict) -> None:
    """Garante que frontend e backend estejam no ar antes dos testes.

    Não inicia os servidores; apenas aguarda caso já estejam executando.
    Sobrescreva com FRONTEND_URL/BACKEND_URL se usar portas diferentes do padrão.
    """
    # A raiz do frontend deve estar acessível (servidor Vite)
    _wait_http(base_urls["frontend"], timeout=90)
    # Saúde do backend: a rota index deve responder (mensagem de boas‑vindas)
    _wait_http(f"{base_urls['backend']}/", timeout=60)


@pytest.fixture(scope="session")
def driver() -> Iterator[webdriver.Chrome]:
    """Fornece uma instância do Chrome WebDriver (headless controlado por SELENIUM_HEADLESS)."""
    headless_env = os.environ.get("SELENIUM_HEADLESS", "1")
    headless = _is_truthy(headless_env)

    options = ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1366,900")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_experimental_option("excludeSwitches", ["enable-logging"])  # reduz logs no Windows

    # Faz fallback para webdriver-manager apenas se necessário.
    try:
        drv = webdriver.Chrome(options=options)
    except Exception:
        # Fallback legado: pode baixar um chromedriver compatível
        from selenium.webdriver.chrome.service import Service as ChromeService  # import local para evitar dependência global
        service = ChromeService(ChromeDriverManager().install())
        drv = webdriver.Chrome(service=service, options=options)
    try:
        yield drv
    finally:
        drv.quit()


@pytest.fixture(autouse=True)
def clear_storage_before_each(driver: webdriver.Chrome, base_urls: dict, ensure_servers: None):  # noqa: ANN001
    """Limpa localStorage e sessionStorage para isolar os testes."""
    driver.get(base_urls["frontend"])  # abre a origem primeiro para escopar corretamente o storage
    driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")


def wait_for_selector(driver: webdriver.Chrome, by: By, value: str, timeout: float = 20):
    return WebDriverWait(driver, timeout).until(EC.presence_of_element_located((by, value)))
