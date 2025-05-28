const {By, Builder, Browser} = require('selenium-webdriver');
const assert = require("assert");

describe('首頁', (async function firstTest() {
  let driver;
  before(async function() {
    driver = await new Builder().forBrowser(Browser.CHROME).build();  
  });
  after(async function() {
    await driver.quit();
  });
  // try {
  it('開啟首頁檢查內容', async function() {
    // driver = await new Builder().forBrowser(Browser.CHROME).build();
    // await driver.get('https://fju-benwu.github.io/agile2025/');
    await driver.get('https://fju-benwu.github.io/agile2025/intro');
  
    let title = await driver.getTitle();
    // console.log("Page title is: " + title);
    assert.equal("輔大資管碩士新生資訊系統", title);
    // let url = await driver.getCurrentUrl();
    let header = await driver.findElement(By.xpath('/html/body/main/div/header/h1'));
    let headerText = await header.getText();
    assert.equal("系所介紹", headerText);
    //為了讓大家看到頁面
    await new Promise(resolve => setTimeout(resolve, 3000));

  });

}));