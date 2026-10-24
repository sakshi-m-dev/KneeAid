
import pytest
import time
from urllib.parse import urlparse

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


BASE_URL = "http://localhost:5173/"


# --------------------------------------------------
# BROWSER SETUP
# --------------------------------------------------

@pytest.fixture(scope="module")
def driver():
    options = Options()
    options.add_argument("--window-size=1365,900")
    options.add_argument("--disable-notifications")
    options.set_capability(
        "goog:loggingPrefs",
        {"browser": "ALL"}
    )

    browser = webdriver.Chrome(options=options)
    browser.set_page_load_timeout(25)

    yield browser

    browser.quit()


def open_homepage(driver):
    driver.get(BASE_URL)

    WebDriverWait(driver, 10).until(
        lambda d: d.execute_script(
            "return document.readyState"
        ) == "complete"
    )


# --------------------------------------------------
# TEST 1: WEBSITE AVAILABILITY AND PAGE LOADING
# --------------------------------------------------

def test_kneeaid_page_loads(driver):
    open_homepage(driver)

    print("\n--- PAGE LOADING TEST ---")
    print("Page title:", driver.title)
    print("Page URL:", driver.current_url)

    assert driver.title.strip(), "Page title is empty"
    assert urlparse(driver.current_url).hostname in (
        "localhost", "127.0.0.1"
    ), "Unexpected website URL"

    assert "5173" in driver.current_url, (
        "Website did not load on the expected port"
    )

    print("RESULT: Homepage loaded successfully")


# --------------------------------------------------
# TEST 2: MAIN CONTENT VISIBILITY
# --------------------------------------------------

def test_kneeaid_content_is_visible(driver):
    open_homepage(driver)

    print("\n--- CONTENT VISIBILITY TEST ---")

    body_text = driver.find_element(
        By.TAG_NAME, "body"
    ).text

    print("Visible page text:\n", body_text)

    assert "KNEEAID" in body_text.upper(), (
        "KneeAid branding was not found"
    )

    assert "WEARABLE KNEE ASSISTANCE PROTOTYPE" in (
        " ".join(body_text.upper().split())
    ), "Main prototype description is missing"

    print("RESULT: Main content is visible")


# --------------------------------------------------
# TEST 3: BUTTONS AND LINKS
# --------------------------------------------------

def test_visible_buttons_and_links(driver):
    open_homepage(driver)

    print("\n--- BUTTON AND LINK TEST ---")

    buttons = driver.find_elements(
        By.CSS_SELECTOR,
        "button, input[type='button'], input[type='submit']"
    )

    links = driver.find_elements(By.TAG_NAME, "a")

    visible_buttons = [
        button for button in buttons
        if button.is_displayed()
    ]

    visible_links = [
        link for link in links
        if link.is_displayed()
    ]

    button_names = [
        button.text.strip() or
        button.get_attribute("aria-label") or
        button.get_attribute("value") or
        "(unnamed button)"
        for button in visible_buttons
    ]

    link_names = [
        link.text.strip() or
        link.get_attribute("aria-label") or
        "(unnamed link)"
        for link in visible_links
    ]

    print("Visible buttons:", button_names)
    print("Visible links:", link_names)

    assert visible_buttons or visible_links, (
        "No visible interactive controls were found"
    )

    print("RESULT: Interactive controls are visible")


# --------------------------------------------------
# TEST 4: INTERNAL NAVIGATION TARGETS
# --------------------------------------------------

def test_internal_navigation_targets_exist(driver):
    open_homepage(driver)

    print("\n--- INTERNAL NAVIGATION TEST ---")

    anchors = driver.find_elements(
        By.CSS_SELECTOR, 'a[href*="#"]'
    )

    checked = 0
    failures = []

    for anchor in anchors:
        href = anchor.get_attribute("href")

        if not href:
            continue

        parsed = urlparse(href)
        fragment = parsed.fragment

        # Ignore external links and empty fragments.
        if parsed.netloc != urlparse(BASE_URL).netloc:
            continue

        if not fragment:
            continue

        targets = driver.find_elements(
            By.ID, fragment
        )

        found = len(targets) > 0

        print(
            f"Target #{fragment}: "
            f"{'FOUND' if found else 'MISSING'}"
        )

        checked += 1

        if not found:
            failures.append(fragment)

    assert checked > 0, (
        "No internal navigation targets were checked"
    )

    assert not failures, (
        f"Missing navigation targets: {failures}"
    )

    print(f"RESULT: {checked} navigation targets verified")


# --------------------------------------------------
# TEST 5: NAVIGATION CLICK
# --------------------------------------------------

def test_internal_navigation_click(driver):
    open_homepage(driver)

    print("\n--- NAVIGATION CLICK TEST ---")

    # Wait for the intro/loading overlay to stop blocking clicks.
    WebDriverWait(driver, 15).until(
        lambda d: d.execute_script("""
            const loader = document.querySelector('#loader');
            if (!loader) return true;

            const style = window.getComputedStyle(loader);
            const rect = loader.getBoundingClientRect();

            return style.display === 'none'
                || style.visibility === 'hidden'
                || style.opacity === '0'
                || rect.width === 0
                || rect.height === 0;
        """)
    )

    links = driver.find_elements(
        By.CSS_SELECTOR, 'a[href^="#"]'
    )

    valid_link = None

    for link in links:
        href = link.get_attribute("href")
        fragment = urlparse(href).fragment if href else ""

        if fragment and driver.find_elements(By.ID, fragment):
            valid_link = link
            break

    assert valid_link is not None, (
        "No internal navigation link with an existing target was found"
    )

    target = urlparse(
        valid_link.get_attribute("href")
    ).fragment

    print("Clicking navigation target:", target)

    driver.execute_script(
        "arguments[0].scrollIntoView({block: 'center'});",
        valid_link
    )

    WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable(valid_link)
    )

    valid_link.click()

    WebDriverWait(driver, 5).until(
        lambda d: urlparse(d.current_url).fragment == target
    )

    print("Current URL:", driver.current_url)
    print("RESULT: Internal navigation click succeeded")



# --------------------------------------------------
# TEST 6: RESPONSIVE LAYOUT
# --------------------------------------------------

@pytest.mark.parametrize(
    "width,height",
    [
        (390, 844),       # Mobile-sized viewport
        (768, 1024),      # Tablet-sized viewport
        (1365, 900),      # Desktop viewport
    ],
)
def test_responsive_layout(driver, width, height):
    open_homepage(driver)

    driver.set_window_size(width, height)
    time.sleep(0.5)

    dimensions = driver.execute_script("""
        return {
            viewport: document.documentElement.clientWidth,
            page: document.documentElement.scrollWidth
        };
    """)

    viewport = dimensions["viewport"]
    page_width = dimensions["page"]

    print(
        f"\n--- RESPONSIVE TEST: {width}x{height} ---"
    )
    print("Viewport width:", viewport)
    print("Document width:", page_width)

    assert page_width <= viewport + 15, (
        f"Horizontal overflow detected at {width}px: "
        f"page width={page_width}, viewport={viewport}"
    )

    print("RESULT: No significant horizontal overflow")

    driver.set_window_size(1365, 900)


# --------------------------------------------------
# TEST 7: JAVASCRIPT RUNTIME ERRORS
# --------------------------------------------------

def test_no_uncaught_javascript_errors(driver):
    open_homepage(driver)

    print("\n--- JAVASCRIPT ERROR TEST ---")

    logs = driver.get_log("browser")

    runtime_errors = []

    for entry in logs:
        message = entry.get("message", "")

        # Report uncaught JavaScript exceptions.
        if (
            "Uncaught" in message
            or "ReferenceError" in message
            or "SyntaxError" in message
            or "TypeError:" in message
        ):
            runtime_errors.append(message)

    if runtime_errors:
        print("JavaScript errors detected:")
        for error in runtime_errors:
            print(error)
    else:
        print("No matching uncaught JavaScript errors detected")

    assert not runtime_errors, (
        "Browser console contains JavaScript runtime errors"
    )

    print("RESULT: No matching runtime errors detected")


# --------------------------------------------------
# TEST 8: PAGE LOAD PERFORMANCE
# --------------------------------------------------

def test_page_load_performance(driver):
    open_homepage(driver)

    print("\n--- PAGE PERFORMANCE TEST ---")

    metrics = driver.execute_script("""
        const nav = performance.getEntriesByType('navigation')[0];

        return {
            domContentLoaded: nav
                ? nav.domContentLoadedEventEnd
                : 0,
            loadComplete: nav
                ? nav.loadEventEnd
                : 0,
            responseTime: nav
                ? nav.responseEnd
                : 0
        };
    """)

    response_ms = metrics["responseTime"]
    dom_ms = metrics["domContentLoaded"]
    load_ms = metrics["loadComplete"]

    print(f"Response time: {response_ms:.2f} ms")
    print(f"DOM content loaded: {dom_ms:.2f} ms")
    print(f"Page load complete: {load_ms:.2f} ms")

    assert response_ms > 0, (
        "Page response timing could not be measured"
    )

    assert load_ms > 0, (
        "Page load completion timing could not be measured"
    )

    # Basic threshold for this local prototype.
    assert load_ms <= 20000, (
        f"Page load took {load_ms:.2f} ms, exceeding 20 seconds"
    )

    print("RESULT: Page load completed within 20 seconds")


# --------------------------------------------------
# TEST 9: PAGE STRUCTURE
# --------------------------------------------------

def test_page_has_valid_basic_structure(driver):
    open_homepage(driver)

    print("\n--- PAGE STRUCTURE TEST ---")

    html_elements = driver.find_elements(By.TAG_NAME, "html")
    body_elements = driver.find_elements(By.TAG_NAME, "body")

    headings = driver.find_elements(
        By.CSS_SELECTOR, "h1, h2, h3"
    )

    print("HTML element found:", bool(html_elements))
    print("Body element found:", bool(body_elements))
    print("Heading count:", len(headings))

    assert html_elements, "HTML element is missing"
    assert body_elements, "Body element is missing"
    assert headings, "No headings were found on the page"

    print("RESULT: Basic page structure verified")
