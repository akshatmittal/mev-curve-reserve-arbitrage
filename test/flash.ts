import { expect } from "chai";
import hre from "hardhat";
import { FlashUSD__factory, IERC20 } from "../typechain";
import { ethers } from "ethers";
// import fetch from "cross-fetch";
import { reset } from "@nomicfoundation/hardhat-network-helpers";

const amount = 500_100;

describe("Flash Loan", function () {
  it("Go", async function () {
    await reset("https://rpc.ankr.com/eth", 16970452); // known good block; improves perf; remove to test on latest block

    const Factory = <FlashUSD__factory>await hre.ethers.getContractFactory("FlashUSD");
    const FlashUSD = await Factory.deploy();

    const [deployer] = await hre.ethers.getSigners();
    const deployerAddr = await deployer.getAddress();

    console.log(deployerAddr);

    const USDT_allowance_cUSDT = {
      target: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      value: 0,
      data:
        `0x095ea7b3` +
        ethers.utils.getAddress("0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9").replace("0x", "").padStart(64, "0") +
        ethers.constants.MaxUint256.toHexString().replace("0x", "").padStart(64, "0"),
    };
    const USDT_allowance_saUSDT = {
      target: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      value: 0,
      data:
        `0x095ea7b3` +
        ethers.utils.getAddress("0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9").replace("0x", "").padStart(64, "0") +
        ethers.constants.MaxUint256.toHexString().replace("0x", "").padStart(64, "0"),
    };

    // const USDT_to_cUSDT = {
    //   target: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
    //   value: 0,
    //   data: `0xa0712d68${ethers.utils.parseUnits("251000", 6).toHexString().replace("0x", "").padStart(64, "0")}`,
    // };

    // const USDT_to_saUSDT = {
    //   target: "0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9",
    //   value: 0,
    //   data:
    //     `0x2f2cab87` +
    //     deployerAddr.replace("0x", "").padStart(64, "0") +
    //     ethers.utils.parseUnits("251000", 6).toHexString().replace("0x", "").padStart(64, "0") +
    //     `0000000000000000000000000000000000000000000000000000000000000000` +
    //     `0000000000000000000000000000000000000000000000000000000000000001`,
    // };

    const eUSD_USDT_allowance = {
      target: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      value: 0,
      data:
        `0x095ea7b3` +
        ethers.utils.getAddress("0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f").replace("0x", "").padStart(64, "0") +
        ethers.constants.MaxUint256.toHexString().replace("0x", "").padStart(64, "0"),
    };

    // const eUSD_cUSDT_allowance = {
    //   target: "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9",
    //   value: 0,
    //   data:
    //     `0x095ea7b3` +
    //     ethers.utils.getAddress("0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f").replace("0x", "").padStart(64, "0") +
    //     ethers.constants.MaxUint256.toHexString().replace("0x", "").padStart(64, "0"),
    // };

    // const eUSD_saUSDT_allowance = {
    //   target: "0x21fe646d1ed0733336f2d4d9b2fe67790a6099d9",
    //   value: 0,
    //   data:
    //     `0x095ea7b3` +
    //     ethers.utils.getAddress("0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f").replace("0x", "").padStart(64, "0") +
    //     ethers.constants.MaxUint256.toHexString().replace("0x", "").padStart(64, "0"),
    // };

    // const eUSD_issue = {
    //   target: "0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f",
    //   value: 0,
    //   data: `0xcc872b66` + ethers.utils.parseUnits("1000000", 18).toHexString().replace("0x", "").padStart(64, "0"),
    // };

    const USDT_transfer = {
      target: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      value: 0,
      data:
        `0xa9059cbb` +
        ethers.utils.getAddress("0xBA12222222228d8Ba445958a75a0704d566BF2C8").replace("0x", "").padStart(64, "0") +
        ethers.BigNumber.from(amount)
          .mul(10 ** 6)
          .toHexString()
          .replace("0x", "")
          .padStart(64, "0"),
    };

    console.log("Executing...");

    await expect(
      FlashUSD.makeFlashLoan([USDT_allowance_cUSDT, USDT_allowance_saUSDT, eUSD_USDT_allowance], [USDT_transfer])
    ).to.not.be.reverted;

    const saUSDT = <IERC20>await hre.ethers.getContractAt("IERC20", "0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9");
    const cUSDT = <IERC20>await hre.ethers.getContractAt("IERC20", "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9");
    const USDT = <IERC20>await hre.ethers.getContractAt("IERC20", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
    const USDC = <IERC20>await hre.ethers.getContractAt("IERC20", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    const eUSD = <IERC20>await hre.ethers.getContractAt("IERC20", "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F");

    console.log(await saUSDT.balanceOf(FlashUSD.address));
    console.log(await cUSDT.balanceOf(FlashUSD.address));
    console.log(await USDT.balanceOf(FlashUSD.address));
    console.log(await USDC.balanceOf(FlashUSD.address));
    console.log(await eUSD.balanceOf(FlashUSD.address));

    const USDT_withdraw = {
      target: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      value: 0,
      data:
        `0xa9059cbb` +
        ethers.utils.getAddress(deployerAddr).replace("0x", "").padStart(64, "0") +
        (await USDT.balanceOf(FlashUSD.address)).toHexString().replace("0x", "").padStart(64, "0"),
    };

    await expect(FlashUSD.runCommands([USDT_withdraw])).to.not.be.reverted;
    console.log(await USDT.balanceOf(deployerAddr));
  });

  it("Reuse", async function () {
    // this test currently fails regardless lol

    const Factory = <FlashUSD__factory>await hre.ethers.getContractFactory("FlashUSD");
    const FlashUSD = Factory.attach("0x43001678Fc1874B54DB40939bA631234f9E21839");

    const USDT_transfer = {
      target: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      value: 0,
      data:
        `0xa9059cbb` +
        ethers.utils.getAddress("0xBA12222222228d8Ba445958a75a0704d566BF2C8").replace("0x", "").padStart(64, "0") +
        ethers.BigNumber.from(amount)
          .mul(10 ** 6)
          .toHexString()
          .replace("0x", "")
          .padStart(64, "0"),
    };

    console.log("Reusing...");

    // console.log(FlashUSD.interface.encodeFunctionData("makeFlashLoan", [[], [USDT_transfer]]));

    await expect(FlashUSD.makeFlashLoan([], [USDT_transfer])).to.not.be.reverted;

    const cUSDT = <IERC20>await hre.ethers.getContractAt("IERC20", "0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9");
    const saUSDT = <IERC20>await hre.ethers.getContractAt("IERC20", "0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9");
    const USDT = <IERC20>await hre.ethers.getContractAt("IERC20", "0xdAC17F958D2ee523a2206206994597C13D831ec7");
    const USDC = <IERC20>await hre.ethers.getContractAt("IERC20", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
    const eUSD = <IERC20>await hre.ethers.getContractAt("IERC20", "0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F");

    console.log(await cUSDT.balanceOf(FlashUSD.address));
    console.log(await saUSDT.balanceOf(FlashUSD.address));
    console.log(await USDT.balanceOf(FlashUSD.address));
    console.log(await USDC.balanceOf(FlashUSD.address));
    console.log(await eUSD.balanceOf(FlashUSD.address));
  });
});
