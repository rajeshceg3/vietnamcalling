from playwright.sync_api import sync_playwright
import os
import time

def verify_ux():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop Context
        context_desktop = browser.new_context(
            viewport={'width': 1440, 'height': 900},
            device_scale_factor=2
        )
        page_desktop = context_desktop.new_page()

        # Load Page
        page_desktop.goto(f"file://{os.path.abspath('index.html')}")
        page_desktop.wait_for_load_state('networkidle')

        # Wait for initial animations (hero fade up)
        time.sleep(2)

        # 1. Capture Desktop Hero
        page_desktop.screenshot(path="desktop_hero.png", full_page=False)
        print("Captured desktop_hero.png")

        # 2. Capture Scrolled Content (Parallax & Layout)
        # Scroll down to the first destination
        page_desktop.evaluate("window.scrollTo(0, 800)")
        time.sleep(1) # Allow scroll and parallax to settle
        page_desktop.screenshot(path="desktop_content.png", full_page=False)
        print("Captured desktop_content.png")

        # Mobile Context
        context_mobile = browser.new_context(
            viewport={'width': 375, 'height': 812},
            device_scale_factor=3,
            is_mobile=True,
            has_touch=True
        )
        page_mobile = context_mobile.new_page()
        page_mobile.goto(f"file://{os.path.abspath('index.html')}")
        page_mobile.wait_for_load_state('networkidle')
        time.sleep(2)

        # 3. Capture Mobile Hero
        page_mobile.screenshot(path="mobile_hero.png")
        print("Captured mobile_hero.png")

        # 4. Capture Mobile Menu Open
        page_mobile.click('.mobile-menu-toggle')
        time.sleep(1) # Wait for menu reveal animation
        page_mobile.screenshot(path="mobile_menu.png")
        print("Captured mobile_menu.png")

        browser.close()

if __name__ == "__main__":
    verify_ux()
