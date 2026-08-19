from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument('--headless')
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

driver = webdriver.Chrome(options=options)
driver.get("https://tarab-bladi.vercel.app/track.html?id=8bfd9215-8f00-4301-96ec-cff50a28b630&from=browse")
time.sleep(5)

# click play
play_btn = driver.find_element("id", "main-play-btn")
play_btn.click()
time.sleep(2)

logs = driver.get_log('browser')
for log in logs:
    print(log)

driver.quit()
