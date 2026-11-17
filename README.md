# Arad Land (QMS Testnet)

Stake QMS → earn ARAD (10 ARAD / day per 1 QMS). Also: GM / counter contract deployers.

## One-time setup
1. Open https://remix.ethereum.org, add `contracts/AradToken.sol` and `contracts/AradStaking.sol`, compile (0.8.20+).
2. Add the QMS Testnet to your wallet (chain 19480, RPC https://rpc.testnet.qms.finance) and choose "Injected Provider".
3. Deploy `AradToken` with `initialSupply` (e.g. `100000000`, whole tokens).
4. Deploy `AradStaking` with `_rewardToken` = the ARAD address and `_rewardPerQmsPerDay` = `10000000000000000000` (10e18).
5. From the token, `transfer` a reward budget (e.g. 10,000,000 ARAD) to the AradStaking address. Rewards are paid from this balance.
6. Put both addresses in `src/lib/config.js`, then `npm install && npm run build` and redeploy to Vercel.

## Theme
All colors are CSS variables at the top of `src/styles.css`.
