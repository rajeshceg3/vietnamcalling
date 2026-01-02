
import os
import sys
from playwright.sync_api import sync_playwright

def run_test(block_js=False):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        file_path = os.path.abspath('index.html')
        url = f'file://{file_path}'

        if block_js:
            print("--- Running Test: Blocked script.js ---")
            # Block script.js
            page.route("**/script.js", lambda route: route.abort())
        else:
            print("--- Running Test: Normal Load ---")

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            page.goto(url)
            page.wait_for_timeout(3500)

            sections = page.query_selector_all('section')
            visible_sections_count = 0
            for section in sections:
                cls = section.get_attribute('class') or ""
                opacity = section.evaluate("el => getComputedStyle(el).opacity")
                visibility = section.evaluate("el => getComputedStyle(el).visibility")
                if opacity == '1' and visibility == 'visible':
                    visible_sections_count += 1

                print(f"Section {section.get_attribute('id')}: Class='{cls}', Opacity={opacity}, Visibility={visibility}")

            print(f"Visible sections (visual): {visible_sections_count}/{len(sections)}")

            if not block_js:
                reading_time = page.query_selector('#reading-time')
                if reading_time:
                    print(f"Reading time found: {reading_time.inner_text()}")
                else:
                    print("Reading time element NOT found")

            if console_errors:
                print("Console Errors:")
                for err in console_errors:
                    if block_js and "script.js" in err and "net::ERR_FAILED" in err:
                        continue
                    print(err)
            else:
                print("No console errors detected.")

            # Take screenshot
            suffix = "blocked" if block_js else "normal"
            page.screenshot(path=f'verification/screenshot_{suffix}.png')

        except Exception as e:
            print(f"Test failed with exception: {e}")

        browser.close()

if __name__ == "__main__":
    run_test(block_js=False)
    print("\n")
    run_test(block_js=True)
