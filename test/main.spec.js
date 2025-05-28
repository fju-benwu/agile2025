const { By, Builder, Browser, until } = require('selenium-webdriver');
const assert = require("assert");

describe('首頁與教師頁自動化測試', function () {
  let driver;
  this.timeout(60000);

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

    // 檢查是否有教師卡片
    let teacherCards = await driver.findElements(By.css('.card'));
    assert.ok(teacherCards.length > 0, "應該至少有一位教師顯示");

    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it('每位專任教師頁面都能點進去再回主頁再點下一位', async function () {
    await driver.get('https://fju-benwu.github.io/agile2025/teacher');
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(),'系所教師')]")), 10000);

    // 預設為專任教師
    let teacherCards = await driver.findElements(By.css('.card'));
    assert.ok(teacherCards.length > 0, "應該至少有一位教師顯示");

    for (let i = 0; i < teacherCards.length; i++) {
      teacherCards = await driver.findElements(By.css('.card'));
      const card = teacherCards[i];

      // 取得教師姓名
      let teacherNameElem = await card.findElement(By.css('h2'));
      let teacherName = await teacherNameElem.getText();

      // 點擊教師卡片
      await card.click();

      // 等待詳細頁面顯示教師姓名
      await driver.wait(until.elementLocated(By.xpath(`//h1[contains(text(),"${teacherName}")]`)), 10000);
      let detailHeader = await driver.findElement(By.xpath(`//h1[contains(text(),"${teacherName}")]`));
      let detailHeaderText = await detailHeader.getText();
      assert.equal(teacherName, detailHeaderText);

      // 點擊「返回教師列表」按鈕
      let backBtn = await driver.findElement(By.xpath("//button[contains(text(),'返回教師列表')]"));
      await backBtn.click();

      // 等待回到教師列表頁
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(),'系所教師')]")), 10000);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });

  it('每位兼任教師頁面都能點進去再回主頁再點下一位', async function () {
    await driver.get('https://fju-benwu.github.io/agile2025/teacher');
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(),'系所教師')]")), 10000);

    // 點擊「兼任教師」按鈕
    let adjunctBtn = await driver.findElement(By.xpath("//button[contains(text(),'兼任教師')]"));
    await adjunctBtn.click();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待切換動畫

    // 取得所有兼任教師卡片
    let teacherCards = await driver.findElements(By.css('.card'));
    assert.ok(teacherCards.length > 0, "應該至少有一位兼任教師顯示");

    for (let i = 0; i < teacherCards.length; i++) {
      teacherCards = await driver.findElements(By.css('.card'));
      const card = teacherCards[i];

      // 取得教師姓名
      let teacherNameElem = await card.findElement(By.css('h2'));
      let teacherName = await teacherNameElem.getText();

      // 點擊教師卡片
      await card.click();

      // 等待詳細頁面顯示教師姓名
      await driver.wait(until.elementLocated(By.xpath(`//h1[contains(text(),"${teacherName}")]`)), 10000);
      let detailHeader = await driver.findElement(By.xpath(`//h1[contains(text(),"${teacherName}")]`));
      let detailHeaderText = await detailHeader.getText();
      assert.equal(teacherName, detailHeaderText);

      // 點擊「返回教師列表」按鈕
      let backBtn = await driver.findElement(By.xpath("//button[contains(text(),'返回教師列表')]"));
      await backBtn.click();

      // 等待回到教師列表頁
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(),'系所教師')]")), 10000);
      // 再次點擊「兼任教師」按鈕，確保回到兼任教師列表
      adjunctBtn = await driver.findElement(By.xpath("//button[contains(text(),'兼任教師')]"));
      await adjunctBtn.click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });
});