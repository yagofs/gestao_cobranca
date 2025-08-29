import os
import time
import uuid

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys


def _frontend(base_urls: dict) -> str:
    return base_urls["frontend"]


def _backend(base_urls: dict) -> str:
    return base_urls["backend"]


@pytest.mark.functional
def test_login_sucesso(driver, base_urls):
    # Arrange: abrir a página de login
    driver.get(_frontend(base_urls) + "/")

    # Act: preencher credenciais do usuário de seed e clicar em Login
    driver.find_element(By.ID, "username").send_keys("teste_user")
    driver.find_element(By.ID, "password").send_keys("senha_teste")
    driver.find_element(By.XPATH, "//button[.//span[text()='Login']]").click()

    # Assert: navegou para /dashboard e o título 'Página Inicial' foi renderizado
    # Espera pela troca de rota e pelo conteúdo
    for _ in range(40):
        if "/dashboard" in driver.current_url:
            break
        time.sleep(0.25)
    assert "/dashboard" in driver.current_url, f"Expected to be on /dashboard, got {driver.current_url}"

    # Espera explicitamente pelo título para reduzir flakiness
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    WebDriverWait(driver, 20).until(
        EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Página Inicial')]"))
    )

    token = driver.execute_script("return window.localStorage.getItem('access_token');")
    assert token, "Expected JWT token in localStorage"


@pytest.mark.functional
def test_falha_login(driver, base_urls):
    driver.get(_frontend(base_urls) + "/")

    driver.find_element(By.ID, "username").send_keys("usuario_invalido")
    driver.find_element(By.ID, "password").send_keys("senha_errada")
    driver.find_element(By.XPATH, "//button[.//span[text()='Login']]").click()

    # Espera por um toast de erro
    found_error = False
    for _ in range(40):
        # Os toasts do Sonner podem usar role="status" ou aria-live; buscamos por texto
        toasts = driver.find_elements(By.XPATH, "//*[contains(text(), 'inválid') or contains(text(), 'Erro ao fazer login')]")
        if toasts:
            found_error = True
            break
        time.sleep(0.25)
    assert found_error, "Expected error toast after invalid login"


@pytest.mark.functional
def test_registro_login(driver, base_urls):
    driver.get(_frontend(base_urls) + "/")

    # Navegar para a tela de cadastro
    driver.find_element(By.XPATH, "//button[normalize-space()='Cadastro de Usuário']").click()

    # Esperar o formulário de cadastro
    for _ in range(40):
        if "/register" in driver.current_url:
            break
        time.sleep(0.25)
    assert "/register" in driver.current_url

    # Gerar usuário único por execução
    new_username = f"user_{uuid.uuid4().hex[:8]}"
    password = "senha123"

    driver.find_element(By.ID, "username").send_keys(new_username)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.ID, "confirmPassword").send_keys(password)

    # Submeter cadastro
    driver.find_element(By.XPATH, "//button[.//span[text()='Cadastrar Usuário']]").click()

    # Esperar redirecionar para Login (e aparecer toast de sucesso)
    for _ in range(80):
        if driver.current_url.rstrip("/") == _frontend(base_urls).rstrip("/"):
            break
        time.sleep(0.25)
    assert driver.current_url.rstrip("/") == _frontend(base_urls).rstrip("/"), "Should return to login after register"

    # Realizar login com o novo usuário
    driver.find_element(By.ID, "username").send_keys(new_username)
    driver.find_element(By.ID, "password").send_keys(password)
    driver.find_element(By.XPATH, "//button[.//span[text()='Login']]").click()

    # Chegar ao dashboard
    for _ in range(40):
        if "/dashboard" in driver.current_url:
            break
        time.sleep(0.25)
    assert "/dashboard" in driver.current_url


@pytest.mark.functional
def test_registrar_acao_contrato_parcela(driver, base_urls):
    # Login
    driver.get(_frontend(base_urls) + "/")
    driver.find_element(By.ID, "username").send_keys("teste_user")
    driver.find_element(By.ID, "password").send_keys("senha_teste")
    driver.find_element(By.XPATH, "//button[.//span[text()='Login']]").click()

    # Aguardar Dashboard
    for _ in range(80):
        if "/dashboard" in driver.current_url:
            break
        time.sleep(0.25)
    assert "/dashboard" in driver.current_url

    # Buscar cooperado pelo CPF e selecionar resultado
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//input[@placeholder='Digite o nome ou CPF...']"))
    )
    search_input = driver.find_element(By.XPATH, "//input[@placeholder='Digite o nome ou CPF...']")
    search_input.clear()
    search_input.send_keys("123.456.789-01")

    # Clicar no resultado do cooperado (texto contém CPF)
    WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//*[contains(text(), '123.456.789-01')]/ancestor::div[contains(@class,'p-3')][1]"))
    ).click()

    # Prosseguir para Contratos
    WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(normalize-space(.), 'Prosseguir para Contratos')]"))
    ).click()

    # Aguardar página de Contratos
    for _ in range(80):
        if "/contracts" in driver.current_url:
            break
        time.sleep(0.25)
    assert "/contracts" in driver.current_url

    # Selecionar contrato específico 
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(., 'Contratos e Parcelas')]"))
    )
    # Clique no checkbox dentro do card do contrato com número 123456789
    checkbox = WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//h3[contains(., 'Contrato 123456789')]/ancestor::div[contains(@class,'p-6')][1]//button[@role='checkbox']"))
    )
    # Garantir visibilidade e foco
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", checkbox)
    checkbox.click()

    # Abrir seletor de parcelas e escolher 'Parcela 1'
    WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[contains(., 'Escolha a parcela em atraso')]]"))
    ).click()
    WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//*[@role='option' and contains(., 'Parcela 1')]"))
    ).click()

    # Aguardar detalhes da parcela aparecerem (confirmação visual)
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//p[contains(., 'Detalhes da parcela')]"))
    )

    # Registrar Ação (garantir que o botão esteja habilitado)
    register_btn = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(normalize-space(.), 'Registrar Ação')]"))
    )
    WebDriverWait(driver, 10).until(lambda d: register_btn.is_enabled() and register_btn.get_attribute('disabled') is None)
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", register_btn)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//button[contains(normalize-space(.), 'Registrar Ação')]")))
    driver.execute_script("arguments[0].click();", register_btn)

    # Em ActionHistory: selecionar tipo de ação e comentar
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(., 'Histórico e Registro de Ação')]"))
    )
    WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//button[.//span[contains(., 'Selecione a ação realizada')]]"))
    ).click()
    WebDriverWait(driver, 20).until(
        EC.element_to_be_clickable((By.XPATH, "//*[@role='option' and normalize-space(.)='Promessa de pagamento']"))
    ).click()

    comment_box = driver.find_element(By.ID, "comment")
    comment_box.clear()
    comment_box.send_keys("Contato realizado e promessa para 10 dias.")

    # Continuar (espera botão habilitar e ficar clicável)
    continuar_btn = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(normalize-space(.), 'Continuar')]"))
    )
    WebDriverWait(driver, 10).until(lambda d: continuar_btn.is_enabled() and continuar_btn.get_attribute('disabled') is None)
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", continuar_btn)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, "//button[contains(normalize-space(.), 'Continuar')]")))
    # Usar JS click para evitar interceptações por overlays/anim.
    driver.execute_script("arguments[0].click();", continuar_btn)

    # Em ActionConfirmation: confirmar registro
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//h1[contains(., 'Confirmação de Registro')]") )
    )
    confirmar_btn = WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(normalize-space(.), 'Confirmar Registro')]"))
    )
    WebDriverWait(driver, 10).until(lambda d: confirmar_btn.is_enabled() and confirmar_btn.get_attribute('disabled') is None)
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", confirmar_btn)
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(normalize-space(.), 'Confirmar Registro')]"))
    )
    driver.execute_script("arguments[0].click();", confirmar_btn)

    # Deve retornar ao Dashboard após sucesso
    for _ in range(80):
        if "/dashboard" in driver.current_url:
            break
        time.sleep(0.25)
    assert "/dashboard" in driver.current_url
