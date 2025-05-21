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
  it('should open the web form and submit it', async function() {
    // driver = await new Builder().forBrowser(Browser.CHROME).build();
    await driver.get('https://fju-benwu.github.io/agile2025/');
  
    let title = await driver.getTitle();
    // console.log("Page title is: " + title);
    assert.equal("輔大資管碩士新生資訊系統", title);
    
  });

}));