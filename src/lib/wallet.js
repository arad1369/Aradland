import { QMS_CHAIN } from "./config.js";

export async function ensureQmsChain() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: QMS_CHAIN.chainId }],
    });
  } catch (e) {
    if (e.code === 4902 || e?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [QMS_CHAIN],
      });
    } else {
      throw e;
    }
  }
}

export const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
