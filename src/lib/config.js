// ---- QMS Testnet (from docs.qms.finance/for-developers/network-and-rpc) ----
export const QMS_CHAIN = {
  chainId: "0x4c18", // 19480
  chainName: "QMS Testnet",
  nativeCurrency: { name: "QMS", symbol: "QMS", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.qms.finance"],
  blockExplorerUrls: ["https://testnet.qmsscan.io"],
};
export const EXPLORER = "https://testnet.qmsscan.io";
export const FAUCET = "https://faucet.testnet.qms.finance";

// ---- Arad Land contracts: paste your deployed addresses here ----
export const ARAD_TOKEN_ADDRESS = "0xCFAc44c0929Af4478b4e383c9f91B1dDeF20e08F";
export const STAKING_ADDRESS = "0xac8217cd472C1caD7843543AB09B168A851Df6cf";

// Must match the value passed to the AradStaking constructor (ARAD per 1 QMS per day)
export const REWARD_PER_QMS_PER_DAY = 10;

export const isDeployed = (a) => /^0x[0-9a-fA-F]{40}$/.test(a) && !/^0x0+$/.test(a);

export const STAKING_ABI = [
  "function stake() payable",
  "function unstake(uint256 amount)",
  "function claim()",
  "function pendingReward(address user) view returns (uint256)",
  "function positions(address) view returns (uint256 amount, uint256 lastUpdate, uint256 pending)",
  "function totalStaked() view returns (uint256)",
  "function totalRewardsPaid() view returns (uint256)",
];

export const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
];
