const { By, Builder, Browser } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const assert = require("assert");

describe('首頁與導覽列測試', function () {
  this.timeout(60000); // 每個測試最多等 60 秒
  let driver;

  before(async function () {
    const options = new chrome.Options();
    // ✅ 不使用 headless，這樣你可以看到畫面
    // ❌ 不加 options.addArguments('--headless');
    driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    // 等最後一個頁面停留 2 秒後關閉
    await driver.sleep(2000);
    await driver.quit();
  });

  it('驗證首頁標題與內容', async function () {
    await driver.get('https://fju-benwu.github.io/agile2025/intro');

    const title = await driver.getTitle();
    assert.equal("輔大資管碩士新生資訊系統", title);

    const header = await driver.findElement(By.xpath('/html/body/main/div/header/h1'));
    const headerText = await header.getText();
    assert.equal("系所介紹", headerText);

    await driver.sleep(3000); // 給你時間看到畫面
  });

  it('驗證導覽列跳轉功能', async function () {
    const baseUrl = 'https://fju-benwu.github.io/agile2025';
    const menuItems = [
      { text: '修業規則', path: '/rules2', xpath: '/html/body/main/div/h1',expectedH1: '修業規則及畢業條件檢核' },
      { text: '師資介紹', path: '/teacher', xpath: '/html/body/main/div/h1',expectedH1: '系所教師' },
      { text: '課程資訊', path: '/course', xpath: '/html/body/main/div/div[2]/h2',expectedH1: '修業規則與必選修課程' },
      { text: '系所介紹', path: '/intro', xpath: '/html/body/main/div/header/h1',expectedH1: '系所介紹' },
    ];

    for (const item of menuItems) {
      await driver.get(baseUrl); // 回首頁
      const link = await driver.findElement(By.linkText(item.text));
      await link.click();

      await driver.sleep(2000); // 停一下讓你看到頁面變化

      const url = await driver.getCurrentUrl();
      assert.ok(url.includes(item.path), `網址應包含 ${item.path}`);

      const h1 = await driver.findElement(By.xpath(item.xpath));
      const h1Text = await h1.getText();
      assert.equal(item.expectedH1, h1Text);
    }
  });
});
