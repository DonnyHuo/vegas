import { ethers } from "ethers";
import { useEffect } from "react";

import { setAddress } from "../store/slice";
import { store } from "../store";

const useWalletListener = () => {
  useEffect(() => {
    // 检查是否安装了钱包
    if (!window.ethereum) {
      console.log("未检测到钱包");
      return;
    }

    // 创建 Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // 监听网络切换
    provider.on("network", (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        console.log("网络已切换：", {
          oldNetwork: oldNetwork.name,
          newNetwork: newNetwork.name
        });
      }
    });

    // 监听账户切换
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        console.log("钱包已断开");
      } else {
        store.dispatch(setAddress(accounts[0]));
        console.log("账户已切换：", accounts[0]);
      }
    };
    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // 监听链 ID 变化
    const handleChainChanged = (chainId) => {
      console.log("链 ID 已切换：", parseInt(chainId, 16));
    };
    window.ethereum.on("chainChanged", handleChainChanged);

    // 清理监听器
    return () => {
      provider.off("network");
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);
};

export default useWalletListener;
