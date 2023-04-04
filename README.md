# MEV Playground

eUSD, Curve, Reserve Protocol arbitrage code

## Execution

Executed TX: [0x6017cf4c6108fb9ac551cb639bfa5df4439001a113c5e7715841790940593665](https://etherscan.io/tx/0x6017cf4c6108fb9ac551cb639bfa5df4439001a113c5e7715841790940593665)

This was made possible because of the massively imbalanced Curve pool at the time of execution. The entire contract and the process is extremely hacky and not efficient at all, can be improved significantly.

Additionally the contract itself does not check for profit, I did the check off-chain and decided it's good enough. I also hardcoded the deployer address to protect from MEV shadow attacks, and sent the signed transaction via Flashbots.

## Process

The initial idea was to encode every call and pass it to an execution contract. The reasoning was based around being able to use `1inch` and `0x` to perform the swaps and just general ease of customization. After testing a bit with that, it turned out using the appropriate curve pool was just as good.

The process went like so:

1. Flash loan 500,100 USDT. I decided to use Balancer for this, would have used AAVE if I needed significantly more funds.
2. Swap 125,050 to cUSDT & saUSDT. The extra 50 because the ratio for eUSD isn't perfectly 1:1:2.
3. Mint 500k eUSD.
4. Swap 500k eUSD to USDC.
5. Swap returned USDC to USDT.
6. Repay flash loan.
7. Profit!

You might notice that `USDT` calls are provided externally. This is because USDT ~~sucks and~~ doesn't follow the ERC20 spec, approvals inside the contract kept failing, and I didn't wanna bother with `SafeERC20`.

## Running

Look into the `test/flash.ts` file to learn more about the actual execution steps.

1. `yarn install`
2. `yarn hardhat test test/flash.ts --grep "Go"`
