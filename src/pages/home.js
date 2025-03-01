import {
  shortStr,
  connectWallet,
  copy,
  getContract,
  getWriteContractLoad
} from "../../src/utils";
import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Button, Dialog, Loading } from "react-vant";

import { GiftO, FireO } from "@react-vant/icons";

import erc20Abi from "../../src/assets/abi/erc20.json";
import stakeAbi from "../../src/assets/abi/stakingContract.json";
import { ReactComponent as Copy } from "../../src/assets/img/copy.svg";
import useWalletListener from "../../src/hooks/useWalletListener";

const Home = () => {
  useWalletListener();
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const [searchParams, setSearchParams] = useSearchParams();

  const removeParam = (key) => {
    searchParams.delete(key); // 删除参数
    setSearchParams(searchParams); // 更新 URL
  };

  const invite = searchParams.get("invite");

  const address = useSelector((state) => state.address);

  const usdtAddress = useSelector((state) => state.usdtAddress);
  const stakingContractAddress = useSelector(
    (state) => state.stakingContractAddress
  );

  const [allowance, setAllowance] = useState(0);

  const getAllowance = async () => {
    const amounts = await getContract(
      usdtAddress,
      erc20Abi,
      "allowance",
      address,
      stakingContractAddress
    );
    const decimals = await getContract(usdtAddress, erc20Abi, "decimals");
    const allowance = ethers.utils.formatUnits(amounts, decimals) * 1;
    setAllowance(allowance);
  };

  useEffect(() => {
    if (address) {
      getAllowance();
    }
  }, [stakingContractAddress, address, usdtAddress]);

  const [approveLoading, setApproveLoading] = useState(false);

  const approveFun = async () => {
    setApproveLoading(true);
    await getWriteContractLoad(
      usdtAddress,
      erc20Abi,
      "approve",
      stakingContractAddress,
      ethers.constants.MaxUint256
    )
      .then(() => {
        toast.success("授权成功");
        setTimeout(() => {
          getAllowance();
        }, 2000);
      })
      .catch(() => toast.error("授权失败"))
      .finally(() => {
        setApproveLoading(false);
      });
  };

  const [stakeLoading, setStakeLoading] = useState(false);

  const [staked, setStaked] = useState(false);

  const getUsers = useCallback(async () => {
    const amounts = await getContract(
      stakingContractAddress,
      stakeAbi,
      "users",
      address
    );
    setStaked(amounts.totalStaked.toString() * 1 > 0);
  }, [stakingContractAddress, address]);

  useEffect(() => {
    if (address) {
      getUsers();
    }
  }, [address, getUsers]);

  const [stakeValue, setStakeValue] = useState("");

  const canStake = useMemo(() => {
    if ((stakeValue * 1) % 100 !== 0) {
      return false;
    }
    if (!staked && stakeValue * 1 < 500) {
      return false;
    }
    if (staked && stakeValue * 1 < 100) {
      return false;
    }
    return true;
  }, [stakeValue, staked]);

  const stakeFun = async () => {
    setStakeLoading(true);
    const decimals = await getContract(usdtAddress, erc20Abi, "decimals");
    await getWriteContractLoad(
      stakingContractAddress,
      stakeAbi,
      "stake",
      ethers.utils.parseUnits(stakeValue, decimals)
    )
      .then((res) => {
        console.log(res);
        toast.success("质押成功");
        setStakeValue("");
      })
      .catch(() => {
        toast.error("质押失败");
      })
      .finally(() => {
        setStakeLoading(false);
      });
  };

  const [userInfo, setUserInfo] = useState({});

  const [rewardTokenInfo, setRewardTokenInfo] = useState({});

  const getRewardTokenInfo = async () => {
    const decimals = await getContract(usdtAddress, erc20Abi, "decimals");
    const symbol = await getContract(usdtAddress, erc20Abi, "symbol");

    setRewardTokenInfo({
      symbol,
      decimals
    });
  };

  useEffect(() => {
    getRewardTokenInfo();
  }, []);

  const getUserInfo = useCallback(async () => {
    await getContract(stakingContractAddress, stakeAbi, "getUserInfo", address)
      .then((userInfo) => {
        setUserInfo({
          claimedRewards:
            ethers.utils.formatUnits(
              userInfo.claimedRewards,
              rewardTokenInfo?.decimals
            ) * 1,
          pendingRewards:
            ethers.utils.formatUnits(
              userInfo.pendingRewards,
              rewardTokenInfo?.decimals
            ) * 1,
          totalRewards:
            ethers.utils.formatUnits(
              userInfo.totalRewards,
              rewardTokenInfo?.decimals
            ) * 1,
          rewardLimit:
            ethers.utils.formatUnits(
              userInfo.rewardLimit,
              rewardTokenInfo?.decimals
            ) * 1,
          rewardToken: rewardTokenInfo?.symbol
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [
    address,
    rewardTokenInfo?.decimals,
    rewardTokenInfo?.symbol,
    stakingContractAddress
  ]);

  useEffect(() => {
    if (address) {
      getUserInfo();
      const timer = setInterval(() => {
        getUserInfo();
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [address, getUserInfo]);

  const [claimLoading, setClaimLoading] = useState(false);

  const claimFun = async () => {
    setClaimLoading(true);
    await getWriteContractLoad(
      stakingContractAddress,
      stakeAbi,
      "claimedRewards"
    )
      .then((res) => {
        toast.success("领取成功");
      })
      .catch(() => toast.error("领取失败"))
      .finally(() => {
        setClaimLoading(false);
      });
  };

  const inviteLink = useMemo(() => {
    return `${window.location.origin}?invite=${address}`;
  }, [address]);

  const [visible, setVisible] = useState(invite);

  const [bindLoading, setBindLoading] = useState(false);

  const bindReferrerFun = async () => {
    console.log("invite.toLocaleLowerCase()", invite.toLocaleLowerCase());
    setBindLoading(true);
    await getWriteContractLoad(
      stakingContractAddress,
      stakeAbi,
      "bindReferrer",
      invite.toLocaleLowerCase()
    )
      .then(() => {
        toast.success("绑定成功");
        removeParam("invite");
      })
      .catch(() => toast.error("绑定失败"))
      .finally(() => {
        setVisible(false);
        setBindLoading(false);
      });
  };

  const confirmButtonText = useMemo(() => {
    if (bindLoading) {
      return <Loading color="#3f45ff" size="20px" />;
    } else {
      return "确认";
    }
  }, [bindLoading]);

  return (
    <div className="home">
      <div className="flex items-center justify-between">
        <div>
          {i18n.language === "en" && (
            <button
              className="text-[14px]"
              onClick={() => changeLanguage("zh")}
            >
              中文
            </button>
          )}
          {i18n.language === "zh" && (
            <button
              className="text-[14px]"
              onClick={() => changeLanguage("en")}
            >
              English
            </button>
          )}
        </div>
        <div>
          {address ? (
            <div className="flex items-center gap-1 text-[14px]">
              <span>{shortStr(address)}</span>
              <Copy
                onClick={() => {
                  copy(address);
                  toast.success("复制成功");
                }}
                className="w-4 h-4"
              />
            </div>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </div>
      <div className="text-center text-[18px] mt-[40px] font-medium">
        {t("welcome")}
      </div>
      <div className="mt-[40px]">
        <div className="mb-2 text-[14px] text-[#111] font-medium">质押金额</div>
        <input
          value={stakeValue}
          className="w-full h-[40px] border border-solid border-[#999] rounded-[8px] px-2 focus:border-[#333] text-[14px]"
          placeholder="请输入您要质押的数量"
          type="text"
          onChange={(e) => setStakeValue(e.target.value)}
        />
        <div className="text-[12px] text-[#999] mt-1">
          <p>{`1、首次质押 >=500(100的倍数)`}</p>
          <p>{`2、二次质押 >=100(100的倍数)`}</p>
        </div>
        <div className="mt-[20px]">
          {allowance ? (
            <Button
              className="w-full"
              round
              type="primary"
              loading={stakeLoading}
              onClick={stakeFun}
              disabled={!canStake}
            >
              <span className="flex items-center justify-center gap-2">
                <FireO fontSize={"20px"} />
                <span>质押</span>
              </span>
            </Button>
          ) : (
            <Button
              className="w-full"
              round
              type="primary"
              loading={approveLoading}
              onClick={approveFun}
            >
              授权
            </Button>
          )}
        </div>
      </div>
      <div className="mt-[30px] pt-[30px] border-0 border-t border-solid border-[#e1e0e0]">
        <span className="text-[14px] text-[#111] font-medium">奖励信息</span>
        <div className="flex items-center justify-between text-[14px] mt-[20px]">
          <span>已领取奖励</span>
          <span>
            {userInfo?.claimedRewards} {userInfo?.rewardToken}
          </span>
        </div>
        <div className="flex items-center justify-between text-[14px] mt-[10px]">
          <span>待领取奖励</span>
          <span>
            {userInfo?.pendingRewards} {userInfo?.rewardToken}
          </span>
        </div>
        <div className="flex items-center justify-between text-[14px] mt-[10px]">
          <span>总奖励</span>
          <span>
            {userInfo?.totalRewards} {userInfo?.rewardToken}
          </span>
        </div>
        <div className="flex items-center justify-between text-[14px] mt-[10px]">
          <span>奖励上限</span>
          <span>
            {userInfo?.rewardLimit} {userInfo?.rewardToken}
          </span>
        </div>
        <Button
          className="w-full !mt-[20px] "
          round
          type="primary"
          loading={claimLoading}
          disabled={!userInfo.pendingRewards}
          onClick={claimFun}
        >
          <span className="flex items-center justify-center gap-2">
            <GiftO fontSize={"20px"} />
            <span>领取奖励</span>
          </span>
        </Button>
      </div>
      {address && (
        <div className="mt-[30px] pt-[30px] border-0 border-t border-solid border-[#e1e0e0]">
          <span className="text-[14px] text-[#111] font-medium">
            邀请好友获得奖励
          </span>
          <div className="flex items-center justify-between mt-[10px]">
            {/* <GuideO fontSize={"20px"} /> */}
            <div className="w-11/12 truncate text-[#999] text-[14px]">
              {inviteLink}
            </div>
            <Copy
              onClick={() => {
                copy(inviteLink);
                toast.success("复制成功");
              }}
              className="w-4 h-4"
            />
          </div>
        </div>
      )}
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        closeButton={false}
        className={"text-[12px]"}
      />

      <Dialog
        visible={visible}
        showCancelButton
        confirmButtonText={confirmButtonText}
        onConfirm={() => {
          bindReferrerFun();
        }}
        onCancel={() => {
          removeParam("invite");
          setVisible(false);
        }}
      >
        <div className="p-[20px] text-center text-[14px]">
          收否接受来自{shortStr(invite)}的邀请
        </div>
      </Dialog>
    </div>
  );
};

export default Home;
