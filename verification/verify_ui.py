from playwright.sync_api import sync_playwright
import os
import time

def scroll_to_bottom(page):
    """Scrolls to bottom of page to trigger IntersectionObservers"""
    # Get scroll height
    prev_height = -1
    while True:
        # Scroll down
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(500) # Wait for scroll
        curr_height = page.evaluate("document.body.scrollHeight")
        if curr_height == prev_height:
            break
        prev_height = curr_height

    # Better yet, for animation triggering, let's scroll in steps
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)

    viewport_height = page.viewport_size['height']
    total_height = page.evaluate("document.body.scrollHeight")

    current_scroll = 0
    while current_scroll < total_height:
        current_scroll += viewport_height
        page.evaluate(f"window.scrollTo(0, {current_scroll})")
        page.wait_for_timeout(800) # Wait for animation to likely finish (0.8s transition)

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # --- Desktop ---
        print("Capturing Desktop...")
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()
        page.goto(f"file://{os.getcwd()}/index.html")

        # Scroll to trigger animations
        scroll_to_bottom(page)

        # Scroll back to top just in case, but full_page screenshot captures everything anyway.
        # Actually, let's stay at bottom or ensure everything is visible.
        # The 'visible' class stays once added.

        page.screenshot(path="verification/desktop.png", full_page=True)

        # --- Mobile ---
        print("Capturing Mobile...")
        context_mobile = browser.new_context(viewport={'width': 375, 'height': 812}, is_mobile=True)
        page_mobile = context_mobile.new_page()
        page_mobile.goto(f"file://{os.getcwd()}/index.html")

        scroll_to_bottom(page_mobile)

        page_mobile.screenshot(path="verification/mobile.png", full_page=True)

        browser.close()
        print("Done.")

if __name__ == "__main__":
    run()
