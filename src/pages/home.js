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
import Card from "../../src/assets/img/card.jpeg";
import { ReactComponent as Copy } from "../../src/assets/img/copy.svg";
import { ReactComponent as CopyMainColor } from "../../src/assets/img/copyMainColor.svg";
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
        toast.success(t("approveSuccess"));
        setTimeout(() => {
          getAllowance();
        }, 2000);
      })
      .catch(() => toast.error(t("approveFail")))
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

  const [rewardTokenInfo, setRewardTokenInfo] = useState({});

  const canStake = useMemo(() => {
    if (stakeValue * 1 > rewardTokenInfo?.balance) {
      return false;
    }
    if ((stakeValue * 1) % 100 !== 0) {
      return false;
    }
    if (stakeValue * 1 < 500) {
      return false;
    }
    return true;
  }, [rewardTokenInfo?.balance, stakeValue]);

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
        toast.success(t("betSuccess"));
        setStakeValue("");
      })
      .catch(() => {
        toast.error(t("betFail"));
      })
      .finally(() => {
        setStakeLoading(false);
      });
  };

  const [userInfo, setUserInfo] = useState({});

  const getRewardTokenInfo = async () => {
    const decimals = await getContract(usdtAddress, erc20Abi, "decimals");
    const symbol = await getContract(usdtAddress, erc20Abi, "symbol");
    const balanceOf = await getContract(
      usdtAddress,
      erc20Abi,
      "balanceOf",
      address
    );

    const balance = ethers.utils.formatUnits(balanceOf, decimals) * 1;

    setRewardTokenInfo({
      symbol,
      decimals,
      balance
    });
  };

  useEffect(() => {
    if (address) {
      getRewardTokenInfo();
      const timer = setInterval(() => {
        getRewardTokenInfo();
      });

      return () => clearInterval(timer);
    }
  }, [address]);

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
    await getWriteContractLoad(stakingContractAddress, stakeAbi, "claimRewards")
      .then((res) => {
        toast.success(t("claimSuccess"));
      })
      .catch((err) => {
        console.log(err);
        toast.error(t("claimFail"));
      })
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
        toast.success(t("bindSuccess"));
        removeParam("invite");
      })
      .catch(() => toast.error(t("bindFail")))
      .finally(() => {
        setVisible(false);
        setBindLoading(false);
      });
  };

  const confirmButtonText = useMemo(() => {
    if (bindLoading) {
      return <Loading color="#3f45ff" size="20px" />;
    } else {
      return t("confirm");
    }
  }, [bindLoading]);

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="home-content">
      <div className="flex items-center justify-between text-[#98e23c] bg-black px-[20px] py-[10px]">
        <div>
          {i18n.language === "en" && (
            <button
              className="text-[14px]"
              onClick={() => changeLanguage("zh")}
            >
              繁体中文
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
              <CopyMainColor
                onClick={() => {
                  copy(address);
                  toast.success(t("copySuccess"));
                }}
                className="w-4 h-4"
              />
            </div>
          ) : (
            <button className="text-[14px]" onClick={connectWallet}>
              {t("connectWallet")}
            </button>
          )}
        </div>
      </div>

      <div className="home">
        <div className="text-center text-[18px] mt-[40px]">
          <span className="font-bold">{t("welcome")}</span>
          <img src={Card} className="mt-[10px]" alt="" />
        </div>
        <div className="mt-[40px] p-[20px] bg-white rounded-lg border border-solid border-[#eeeeee]">
          <div className="mb-2 text-[14px] font-medium flex items-center justify-between">
            <span className="font-bold">{t("betAmount")}</span>
            <span className="font-[300] text-[12px]">
              {t("balance")}:{Number(rewardTokenInfo?.balance ?? 0).toFixed(2)}{" "}
              {rewardTokenInfo?.symbol}
            </span>
          </div>
          <input
            value={stakeValue}
            className="w-full h-[40px] border border-solid bg-transparent border-[#999] rounded-[8px] px-2 focus:border-black text-[14px]"
            placeholder=">=500"
            type="text"
            onChange={(e) => setStakeValue(e.target.value)}
          />
          <div className="mt-[20px]">
            {allowance ? (
              <Button
                className="w-full bg-black text-[#98e23c]"
                round
                type="default"
                loading={stakeLoading}
                onClick={stakeFun}
                disabled={!canStake}
              >
                <span className="flex items-center justify-center gap-2">
                  <FireO fontSize={"20px"} />
                  <span>{t("bet")}</span>
                </span>
              </Button>
            ) : (
              <Button
                className="w-full bg-black text-[#98e23c] font-medium"
                round
                type="default"
                loading={approveLoading}
                onClick={approveFun}
              >
                {t("approve")}
              </Button>
            )}
          </div>
        </div>
        {address && (
          <div className="mt-[20px] p-[20px] bg-white rounded-lg border border-solid border-[#eeeeee]">
            <span className="text-[14px] font-bold">
              {t("inviteFriendReward")}
            </span>
            <div className="flex items-center justify-between mt-[10px]">
              {/* <GuideO fontSize={"20px"} /> */}
              <div className="w-11/12 truncate text-[#747373] text-[12px]">
                {inviteLink}
              </div>
              <Copy
                onClick={() => {
                  if (!staked) {
                    return toast.error(t("shareTips"));
                  }
                  copy(inviteLink);
                  toast.success(t("copySuccess"));
                }}
                className="w-4 h-4"
              />
            </div>
          </div>
        )}
        <div className="mt-[20px] p-[20px] bg-white rounded-lg border border-solid border-[#eeeeee]">
          <span className="text-[14px] font-bold">{t("rewardInfo")}</span>
          <div className="flex items-center justify-between text-[12px] mt-[20px]">
            <span>{t("claimedReward")}</span>
            <span>
              {Number(userInfo?.claimedRewards ?? 0).toFixed(6)}{" "}
              {userInfo?.rewardToken}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-[10px]">
            <span>{t("pendingReward")}</span>
            <span>
              {Number(userInfo?.pendingRewards ?? 0).toFixed(6)}{" "}
              {userInfo?.rewardToken}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-[10px]">
            <span>{t("totalReward")}</span>
            <span>
              {Number(userInfo?.totalRewards ?? 0).toFixed(6)}{" "}
              {userInfo?.rewardToken}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-[10px]">
            <span>{t("rewardLimit")}</span>
            <span>
              {userInfo?.rewardLimit} {userInfo?.rewardToken}
            </span>
          </div>
          <Button
            className="w-full !mt-[20px] bg-black text-[#98e23c]"
            round
            type="default"
            loading={claimLoading}
            disabled={!(userInfo.pendingRewards * 1 >= 100)}
            onClick={claimFun}
          >
            <span className="flex items-center justify-center gap-2">
              <GiftO fontSize={"20px"} />
              <span>{t("claimReward")}</span>
            </span>
          </Button>
          <div className="text-[12px] text-[#666] mt-1">
            {t("claimTips", { name: userInfo?.rewardToken })}
          </div>
        </div>

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
          theme="dark"
          closeButton={false}
          className={"text-[14px] font-bold !text-[#98e23c] !font-Montserrat"}
        />

        <Dialog
          visible={visible}
          showCancelButton
          confirmButtonText={confirmButtonText}
          cancelButtonText={t("cancel")}
          onConfirm={() => {
            bindReferrerFun();
          }}
          onCancel={() => {
            removeParam("invite");
            setVisible(false);
          }}
        >
          <div className="p-[20px] text-center text-[14px]">
            {t("acceptInvitation", { address: shortStr(invite) })}
            {/* 收否接受来自{shortStr(invite)}的邀请 */}
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;
