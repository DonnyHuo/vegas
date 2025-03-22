import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import Marquee from "react-fast-marquee";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useSearchParams, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Button, Dialog, Loading, Switch } from "react-vant";

import { GiftO, FireO } from "@react-vant/icons";

import erc20Abi from "../../src/assets/abi/erc20.json";
import stakeAbi from "../../src/assets/abi/stakingContract.json";
import stakeAbiV2 from "../../src/assets/abi/stakingContractV2.json";
import Card from "../../src/assets/img/card.jpeg";
import { ReactComponent as Click } from "../../src/assets/img/click.svg";
import { ReactComponent as Money } from "../../src/assets/img/money.svg";
import { ReactComponent as Notice } from "../../src/assets/img/notice.svg";
import { shortStr, getContract, getWriteContractLoad } from "../../src/utils";
import { fetchData } from "../http/request";
import { setVersion } from "../store/slice";
import { store } from "../store";

const Home = () => {
  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const removeParam = (key) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
  };

  const versionFromUrl = searchParams.get("version");

  if (versionFromUrl) {
    store.dispatch(setVersion(Number(versionFromUrl)));
  }

  const invite = searchParams.get("invite");

  const address = useSelector((state) => state.address);
  const version = useSelector((state) => state.version);

  const usdtAddress = useSelector((state) =>
    version === 2 ? state.usdtAddressV2 : state.usdtAddress
  );

  const stakingContractAddressV2 = useSelector(
    (state) => state.stakingContractAddressV2
  );
  const stakingContractAddressV1 = useSelector(
    (state) => state.stakingContractAddress
  );

  const stakingContractAddress = useSelector((state) =>
    version === 2
      ? state.stakingContractAddressV2
      : state.stakingContractAddress
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

  const [referrer, setReferrer] = useState("");

  const [staked, setStaked] = useState(false);

  const getUsers = useCallback(async () => {
    const amounts = await getContract(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "users",
      address
    );
    setReferrer(amounts.referrer);
    setStaked(amounts.totalStaked.toString() * 1 > 0);
  }, [stakingContractAddress, address, version]);

  useEffect(() => {
    if (address) {
      getUsers();
    }
  }, [address, getUsers, version]);

  const [stakeValue, setStakeValue] = useState("");

  const [rewardTokenInfo, setRewardTokenInfo] = useState({});

  const [stakedAmount, setStakedAmount] = useState(0);

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
    if (stakedAmount && version === 1) {
      return false;
    }
    return true;
  }, [rewardTokenInfo?.balance, stakeValue, stakedAmount, version]);

  const stakeFun = async () => {
    if (stakedAmount) {
      return;
    }
    setStakeLoading(true);
    const decimals = await getContract(usdtAddress, erc20Abi, "decimals");
    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "stake",
      ethers.utils.parseUnits(stakeValue, decimals)
    )
      .then((res) => {
        console.log(res);
        toast.success(t("betSuccess"));
        setStakeValue("");
        setTimeout(() => {
          getStaked(address);
        }, 2000);
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
  }, [address, version]);

  const getUserInfo = useCallback(async () => {
    await getContract(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "getUserInfo",
      address
    )
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
    stakingContractAddress,
    version
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
      version === 2 ? stakeAbiV2 : stakeAbi,
      "claimRewards"
    )
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

  const [visible, setVisible] = useState(false);

  const [visibleTip, setVisibleTip] = useState(false);

  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (invite) {
      if (staked) {
        setShowTips(true);
      } else {
        if (referrer) {
          referrer === ethers.constants.AddressZero
            ? setVisible(true)
            : setVisibleTip(true);
        }
      }
    }
  }, [referrer, invite, t, staked, version]);

  const [bindLoading, setBindLoading] = useState(false);

  const bindReferrerFun = async () => {
    setBindLoading(true);

    const overrides = {
      gasLimit: 300000
      // gasPrice: ethers.utils.parseUnits("5", "gwei")
    };

    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "bindReferrer",
      invite.toLocaleLowerCase(),
      overrides
    )
      .then(() => {
        toast.success(t("bindSuccess"));
        removeParam("invite");
      })
      .catch((err) => {
        console.log("err", err);
        toast.error(t("bindFail"));
      })
      .finally(() => {
        setVisible(false);
        setBindLoading(false);
      });
  };

  const [reBindLoading, setReBindLoading] = useState(false);

  const reBindReferrerFun = async (inviter) => {
    setReBindLoading(true);

    const overrides = {
      gasLimit: 300000
      // gasPrice: ethers.utils.parseUnits("5", "gwei")
    };

    await getWriteContractLoad(
      stakingContractAddress,
      stakeAbiV2,
      "bindReferrer",
      inviter.toLocaleLowerCase(),
      overrides
    )
      .then(() => {
        toast.success(t("bindSuccess"));
      })
      .catch((err) => {
        console.log("err", err);
        toast.error(t("bindFail"));
      })
      .finally(() => {
        setShowChangeVersionModal(false);
        setReBindLoading(false);
      });
  };

  const confirmButtonText = useMemo(() => {
    if (bindLoading) {
      return <Loading color="#3f45ff" size="20px" />;
    } else {
      return t("confirm");
    }
  }, [bindLoading]);

  const reConfirmButtonText = useMemo(() => {
    if (reBindLoading) {
      return <Loading color="#3f45ff" size="20px" />;
    } else {
      return t("confirm");
    }
  }, [reBindLoading]);

  const [rewardList, setRewardList] = useState([]);

  const getRewardList = async (address) => {
    const data = `query {
        rewardClaimeds(
          where: {user: "${address}"}
          orderBy: blockTimestamp
          orderDirection: desc
          first: 10
        ) {
          user
          amount
          transactionHash
          blockTimestamp
        }
      }`;

    const res = await fetchData(data);
    setRewardList(res.rewardClaimeds);
  };

  const getStaked = async (address) => {
    const data = `query {
      user(id: "${address}"){
          stakedAmount
      }   
    }`;
    const res = await fetchData(data);

    const stakedAmount = res.user?.stakedAmount;

    setStakedAmount(stakedAmount ? stakedAmount / 10 ** 18 : 0);
  };

  useEffect(() => {
    if (address) {
      getRewardList(address);
      getStaked(address);
    }
  }, [address, version]);

  const [versionState, setVersionState] = useState(version);

  const changeVersion = (value) => {
    setVersionState(value);
    setSearchParams({ version: value });
    store.dispatch(setVersion(value));
    setTimeout(() => {
      window.location.reload();
    });
  };

  // console.log(staked);

  const [stakeInfoV1, setStakeInfoV1] = useState({
    referrer: ethers.constants.AddressZero,
    staked: ""
  });

  const [stakeInfoV2, setStakeInfoV2] = useState({
    referrer: "",
    isNotStaked: ""
  });

  const getV1Staked = useCallback(async () => {
    const amounts = await getContract(
      stakingContractAddressV1,
      stakeAbi,
      "users",
      address
    );

    if (amounts.referrer !== ethers.constants.AddressZero) {
      const res = await getContract(
        stakingContractAddressV2,
        stakeAbiV2,
        "users",
        amounts.referrer
      );
      setStakeInfoV1({
        referrer: amounts.referrer,
        staked: res.totalStaked.toString() * 1 > 0
      });
    }
  }, [address, stakingContractAddressV1, stakingContractAddressV2]);

  const getV2Staked = useCallback(async () => {
    const amounts = await getContract(
      stakingContractAddressV2,
      stakeAbiV2,
      "users",
      address
    );

    setStakeInfoV2({
      referrer: amounts.referrer,
      isNotStaked: amounts.totalStaked.toString() * 1 === 0
    });
  }, [address, stakingContractAddressV2]);

  useEffect(() => {
    if (version === 2 && address) {
      getV1Staked();
      getV2Staked();
    }
  }, [getV1Staked, getV2Staked, address, version]);

  const showChangeVersionBindReffer = useMemo(() => {
    return (
      stakeInfoV2?.referrer === ethers.constants.AddressZero &&
      stakeInfoV2.isNotStaked &&
      stakeInfoV1.referrer !== ethers.constants.AddressZero &&
      stakeInfoV1.staked &&
      version === 2
    );
  }, [
    stakeInfoV1.referrer,
    stakeInfoV1.staked,
    stakeInfoV2?.referrer,
    stakeInfoV2.isNotStaked,
    version
  ]);

  const [showChangeVersionModal, setShowChangeVersionModal] = useState(false);

  useEffect(() => {
    setShowChangeVersionModal(showChangeVersionBindReffer);
  }, [
    showChangeVersionBindReffer,
    stakeInfoV1.referrer,
    stakeInfoV1.staked,
    stakeInfoV2.referrer,
    stakeInfoV2.staked,
    version
  ]);

  return (
    <div className="content-box">
      <div className="flex items-center gap-2 px-[20px] pt-2">
        <Notice />
        <Marquee className="text-[14px] text-[#FF9500] font-bold" speed={80}>
          {t("notice")}💪💪💪
        </Marquee>
      </div>
      <div className="home">
        <div className="text-center text-[18px]">
          <div className="font-bold mt-[10px] mb-[20px] flex items-start justify-between">
            <div className="flex flex-col items-start">
              <p>{t("welcome")}</p>
              <div>
                <Link
                  className="text-[14px] font-bold underline text-[#98E23C]"
                  to="/introduction"
                >
                  {t("foundationIntroduction")}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                size="20px"
                activeColor={"#000000"}
                inactiveColor={"#98E23C"}
                defaultChecked={versionState}
                activeValue={2}
                inactiveValue={1}
                onChange={changeVersion}
              />
              <span className="text-[12px]">
                {version === 1 ? <>{t("switchV1")}</> : <>{t("switchV2")}</>}
              </span>
            </div>
          </div>
          <img className="rounded-[24px]" src={Card} alt="" />
        </div>
        <div className="relative bg-black mt-[20px] rounded-[12px] text-[#98E23C] font-bold px-[24px] py-[12px]">
          <div className="text-[16px]">{t("participatedAmount")}</div>
          <div className="text-[20px]">
            {stakedAmount} {rewardTokenInfo?.symbol}
          </div>
          <div className="absolute right-0 -top-8">
            <Money />
          </div>
        </div>
        <div className="mt-[20px] p-[20px] bg-white rounded-lg border border-solid border-black">
          <div className="mb-2 text-[14px] font-medium flex items-center justify-between">
            <span className="font-bold text-[16px]">{t("betAmount")}</span>{" "}
            <span className="text-[12px] ">
              <span className="text-[#767676]">{t("balance")}:</span>{" "}
              <span className="text-black">
                {Number(rewardTokenInfo?.balance ?? 0).toFixed(2)}{" "}
                {rewardTokenInfo?.symbol}
              </span>
            </span>
          </div>
          <input
            value={stakeValue}
            className="w-full h-[40px] border border-solid bg-transparent border-[#999] rounded-[55px] px-4 focus:border-black text-[14px]"
            placeholder="≥500"
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
                {stakedAmount && version === 1 ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>{t("rebet")}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FireO fontSize={"20px"} />
                    <span>{t("bet")}</span>
                  </span>
                )}
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

        <div className="relative mt-[20px] p-[20px] bg-white rounded-lg border border-solid border-black">
          <span className="text-[16px] font-bold">{t("rewardInfo")}</span>
          <Link
            to="/invite"
            className="rounded-tr-lg rounded-bl-lg bg-black absolute right-0 top-0 text-[#98E23C] text-[12px] font-bold px-2 py-1"
          >
            {t("accelerateEarnings")}
            <Click className="absolute -right-4 -bottom-6" />
          </Link>
          <div className="flex items-center justify-between text-[12px] mt-[20px]">
            <span>{t("claimedReward")}</span>
            <span>
              <span className="text-[#27B53D] text-[18px] font-bold">
                {Number(userInfo?.claimedRewards ?? 0).toFixed(6)}
              </span>{" "}
              {userInfo?.rewardToken}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-[10px]">
            <span>{t("pendingReward")}</span>
            <span className="">
              <span className="text-[#27B53D] text-[18px] font-bold">
                {Number(userInfo?.pendingRewards ?? 0).toFixed(6)}
              </span>{" "}
              {userInfo?.rewardToken}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-[10px]">
            <span>{t("totalReward")}</span>
            <span>
              <span className="text-[#27B53D] text-[18px] font-bold">
                {Number(userInfo?.totalRewards ?? 0).toFixed(6)}
              </span>{" "}
              {userInfo?.rewardToken}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-[10px]">
            <span>{t("rewardLimit")}</span>
            <span>
              <span className="text-[#27B53D] text-[18px] font-bold">
                {userInfo?.rewardLimit}
              </span>{" "}
              {userInfo?.rewardToken}
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
          <div className="text-[12px] text-[#9F9F9F] mt-[10px]">
            {t("claimTips", { name: userInfo?.rewardToken })}
          </div>
        </div>

        <div className="mt-[20px] p-[20px] bg-white rounded-lg border border-solid border-black">
          <div className="text-black text-[16px] font-bold mb-[10px]">
            {t("earningsRecord")}
          </div>
          {rewardList?.length ? (
            rewardList?.map((list) => {
              return (
                <div
                  className="py-2 border-0 border-b border-solid border-[#D8D8D8] last:border-b-0"
                  key={list.transactionHash}
                >
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[14px]">{t("withdrawalAmount")}</span>
                    <span>
                      <span className="text-[#27B53D] font-bold">
                        {list.amount / 10 ** 18}
                      </span>{" "}
                      <span className="text-[14px]">USDT</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[14px]">{t("transactionHash")}</span>
                    <span className="text-[14px] text-[#767676]">
                      {shortStr(list.transactionHash)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center text-[14px] h-[100px]">
              {t("noData")}
            </div>
          )}
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
            <p className="font-bold mb-2">
              {version === 2 ? t("switchV2") : t("switchV1")}
            </p>
            <p>{t("acceptInvitation", { address: shortStr(invite) })}</p>
          </div>
        </Dialog>

        <Dialog
          visible={visibleTip}
          showCancelButton
          showConfirmButton={false}
          cancelButtonText={t("cancel")}
          onCancel={() => {
            removeParam("invite");
            setVisibleTip(false);
          }}
        >
          <div className="p-[20px] text-center text-[14px] font-medium">
            {t("alreadyAccepted")}
          </div>
        </Dialog>

        <Dialog
          visible={showTips}
          showCancelButton
          showConfirmButton={false}
          cancelButtonText={t("cancel")}
          onCancel={() => {
            removeParam("invite");
            setShowTips(false);
          }}
        >
          <div className="p-[20px] text-center text-[14px] font-medium">
            {t("alreadyStaked")}
          </div>
        </Dialog>

        <Dialog
          visible={showChangeVersionModal}
          showCancelButton
          cancelButtonText={t("cancel")}
          confirmButtonText={reConfirmButtonText}
          onConfirm={() => {
            reBindReferrerFun(stakeInfoV1.referrer);
          }}
          onCancel={() => {
            setShowChangeVersionModal(false);
          }}
        >
          <div className="p-[20px] text-center text-[14px]">
            <p className="font-bold mb-2">{t("switchV2")}</p>
            <p>{t("invitationDetected")}</p>
            <p className="mt-2">{t("confirmToBind")}</p>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;
