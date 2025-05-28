const { By, Builder, Browser, until } = require('selenium-webdriver');
const assert = require("assert");

describe('首頁與教師頁自動化測試', function () {
  let driver;
  this.timeout(30000);

  before(async function () {
    driver = await new Builder().forBrowser(Browser.CHROME).build();
  });
  after(async function () {
    await driver.quit();
  });

  it('開啟首頁檢查內容', async function () {
    await driver.get('https://fju-benwu.github.io/agile2025/intro');
    let title = await driver.getTitle();
    assert.equal("輔大資管碩士新生資訊系統", title);
    let header = await driver.findElement(By.xpath('/html/body/main/div/header/h1'));
    let headerText = await header.getText();
    assert.equal("系所介紹", headerText);
    await new Promise(resolve => setTimeout(resolve, 3000));
  });

  it('開啟教師頁檢查內容', async function () {
    await driver.get('https://fju-benwu.github.io/agile2025/teacher');
    let title = await driver.getTitle();
    assert.equal("輔大資管碩士新生資訊系統", title);

    // 等待教師列表標題出現
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(),'系所教師')]")), 10000);
    let teacherHeader = await driver.findElement(By.xpath("//h1[contains(text(),'系所教師')]"));
    let teacherHeaderText = await teacherHeader.getText();
    assert.equal("系所教師", teacherHeaderText);

    // 檢查是否有教師卡片（根據你的渲染，這裡假設有至少一位教師）
    let teacherCards = await driver.findElements(By.css('.card'));
    assert.ok(teacherCards.length > 0, "應該至少有一位教師顯示");

    await new Promise(resolve => setTimeout(resolve, 3000));
  });
});