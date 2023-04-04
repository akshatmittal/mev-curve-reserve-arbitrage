// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import { IVault, IERC20 } from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import { IFlashLoanRecipient } from "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";

import { IStaticATokenLM } from "./interfaces/IStaticATokenLM.sol";
import { ICToken } from "./interfaces/ICToken.sol";

import { Executor } from "./Executor.sol";

// import "hardhat/console.sol";

interface CurvePool {
    // v2 meta
    function exchange_underlying(int128 i, int128 j, uint256 dx, uint256 min_dy) external;

    // v1
    function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) external;
}

interface IRToken is IERC20 {
    function issue(uint256 amount) external;
}

// solhint-disable
contract FlashUSD is IFlashLoanRecipient, Executor {
    IVault private constant vault = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

    IERC20 private constant weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    IRToken private constant eUSD = IRToken(0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F);

    IERC20 private constant USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    IERC20 private constant USDT = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);
    ICToken private constant cUSDT = ICToken(0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9);
    IStaticATokenLM private constant saUSDT = IStaticATokenLM(0x21fe646D1Ed0733336F2D4d9b2FE67790a6099D9);

    CurvePool private constant curvePool = CurvePool(0xAEda92e6A3B1028edc139A4ae56Ec881f3064D4F);
    CurvePool private constant pool3 = CurvePool(0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7);

    address private constant recv = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266; // change this to your address

    function makeFlashLoan(Call[] calldata preCalls, Call[] calldata postCalls) external {
        require(msg.sender == recv);

        IERC20[] memory assets = new IERC20[](1);
        assets[0] = USDT;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 500_100 * 10 ** 6;

        executeCalls(preCalls);

        saUSDT.approve(address(eUSD), type(uint256).max);
        cUSDT.approve(address(eUSD), type(uint256).max);
        eUSD.approve(address(curvePool), type(uint256).max);
        USDC.approve(address(pool3), type(uint256).max);

        vault.flashLoan(this, assets, amounts, abi.encode(postCalls));
    }

    function runCommands(Call[] memory calls) external {
        require(msg.sender == recv);

        executeCalls(calls);
    }

    function receiveFlashLoan(
        IERC20[] memory,
        uint256[] memory amounts,
        uint256[] memory,
        bytes memory userData
    ) external override {
        require(msg.sender == address(vault));

        Call[] memory postCalls = abi.decode(userData, (Call[]));

        // Mint cUSDT
        // USDT.approve(address(cUSDT), type(uint256).max);
        cUSDT.mint(125_050 * 10 ** 6);

        // Mint saUSDT
        // USDT.approve(address(saUSDT), type(uint256).max);
        saUSDT.deposit(address(this), 125_050 * 10 ** 6, 0, true);

        // Mint eUSD
        // USDT.approve(address(eUSD), type(uint256).max);
        // saUSDT.approve(address(eUSD), type(uint256).max);
        // cUSDT.approve(address(eUSD), type(uint256).max);
        eUSD.issue(500_000 * 10 ** 18);

        // eUSD.approve(address(curvePool), type(uint256).max);
        curvePool.exchange_underlying(0, 2, eUSD.balanceOf(address(this)), 0);

        pool3.exchange(1, 2, USDC.balanceOf(address(this)), amounts[0]);

        // console.log("USDT balance: %s", USDT.balanceOf(address(this)));
        // console.log("USDC balance: %s", USDC.balanceOf(address(this)));
        // console.log("cUSDT balance: %s", cUSDT.balanceOf(address(this)));
        // console.log("saUSDT balance: %s", saUSDT.balanceOf(address(this)));
        // console.log("eUSD balance: %s", eUSD.balanceOf(address(this)));

        executeCalls(postCalls);

        saUSDT.withdraw(address(this), saUSDT.balanceOf(address(this)), true);
        cUSDT.redeem(cUSDT.balanceOf(address(this)));
    }
}
