require("dotenv").config();
const puppeteer = require("puppeteer");
const ethers = require("ethers");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (!process.env.SECONDARY_WALLET_ADDRESS) {
  return console.error("Please set necessary environment variables!");
}

const rpcUrl = "https://matic-mumbai.chainstacklabs.com";

const provider = ethers.getDefaultProvider(rpcUrl);

const extractFromFaucet = async () => {
  try {
    // Initialize a new wallet
    let wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    wallet = wallet.connect(provider);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );
    await page.goto("https://faucet.polygon.technology/");
    await page.waitForSelector(`input[type='text']`);
    // await page.$eval(
    //   `input[type='text']`,
    //   (e, walletAddress) => {
    //     e.value = walletAddress;
    //   },
    //   walletAddress
    // );
    await page.type(`input[type='text']`, walletAddress, { delay: 20 });
    console.log(walletAddress);
    await sleep(1000);
    await page.click("button");
    await sleep(1000);
    await page.waitForSelector(
      ".font-body-medium.details.font-bold.ps-t-8.ps-b-24"
    );
    await page.waitForSelector(".btn-primary");
    const ar = await page.$$(".btn-primary");
    await sleep(2000);
    await ar[1].click();
    await sleep(3000);
    console.log(ar[1]);
    setTimeout(() => {
      sendToWallet(wallet, walletAddress);
    }, 60000);
    setTimeout(async () => {
      await browser.close();
    }, 5000);
  } catch (err) {
    console.error(err);
  }
};

const sendToWallet = (wallet, walletAddress) => {
  provider.getBalance(walletAddress).then((balance) => {
    // convert a currency unit from wei to ether
    const balanceInEth = ethers.utils.formatEther(balance);
    console.log(`balance: ${balanceInEth} ETH`);
    let finalSendBalance = parseFloat(balanceInEth) - 0.01;
    console.log(finalSendBalance);
    wallet
      .sendTransaction({
        to: process.env.SECONDARY_WALLET_ADDRESS,
        value: ethers.utils.parseEther(finalSendBalance.toString()),
      })
      .then((txObj) => {
        console.log("txHash", txObj.hash);
      })
      .catch((err) => console.log("error sending", err));
  });
};

extractFromFaucet();

setInterval(() => {
  extractFromFaucet();
}, 10000);

// setInterval(() => {
//   sendToWallet();
// }, 300000);

// bruh
// bruhh
