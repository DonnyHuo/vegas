import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "react-vant";

import stakeAbi from "../../src/assets/abi/stakingContract.json";
import stakeAbiV2 from "../../src/assets/abi/stakingContractV2.json";
import { ReactComponent as Cancel } from "../../src/assets/img/cancel.svg";
import { ReactComponent as GoBack } from "../../src/assets/img/goBack.svg";
import { ReactComponent as Hot } from "../../src/assets/img/hot.svg";
import { ReactComponent as Setting } from "../../src/assets/img/setting.svg";
import { getContract, getWriteContractLoad } from "../utils";
import AdminHeader from "./header";

const Contract = () => {
  const version = useSelector((state) => state.version);

  const stakingContractAddress = useSelector((state) =>
    version === 2
      ? state.stakingContractAddressV2
      : state.stakingContractAddress
  );

  const [transferOwnerAddress, setTransferOwnerAddress] = useState("");

  const [transferLoading, setTransferLoading] = useState(false);

  const transferOwner = async () => {
    if (!ethers.utils.isAddress(transferOwnerAddress)) {
      return toast.error("请输入正确的转移地址");
    }
    setTransferLoading(true);
    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "transferOwnership",
      transferOwnerAddress
    )
      .then(() => {
        toast.success("转移成功");
      })
      .catch(() => {
        toast.error("转移失败");
      })
      .finally(() => {
        setTransferLoading(false);
      });
  };

  const [rewardNumber, setRewardNumber] = useState("");

  const [rewardRate, setRewardRate] = useState("");

  const [rewardRateLoading, setRewardRateLoading] = useState(false);

  const setRewardRateFun = async () => {
    const numberRege = /^(1[0-5]|[1-9])$/;

    const rateRege = /^(100|[1-9][0-9]?)$/;

    if (!numberRege.test(rewardNumber)) {
      return toast.error("请输入正确的代数");
    }

    if (!rateRege.test(rewardRate)) {
      return toast.error("请输入正确的比例");
    }

    setRewardRateLoading(true);
    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "setRewardRate",
      rewardNumber * 100,
      rewardRate * 100
    )
      .then(() => {
        toast.success("设置成功");
      })
      .catch(() => {
        toast.error("设置失败");
      })
      .finally(() => {
        setRewardRateLoading(false);
      });
  };

  const [dailyRewardRate, setDailyRewardRate] = useState("");

  const [dailyRewardRateLoading, setDailyRewardRateLoading] = useState(false);

  const setDailyRewardRateFun = async () => {
    const rateRege = /^(100|[1-9]?[0-9])$/;

    if (!rateRege.test(dailyRewardRate)) {
      return toast.error("请输入正确的收益率");
    }

    setDailyRewardRateLoading(true);
    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "setDailyRewardRate",
      dailyRewardRate
    )
      .then(() => {
        toast.success("设置成功");
      })
      .catch(() => {
        toast.error("设置失败");
      })
      .finally(() => {
        setDailyRewardRateLoading(false);
      });
  };

  const [maxGeneration, setMaxGeneration] = useState("");

  const [maxGenerationLoading, setMaxGenerationLoading] = useState(false);

  const setMaxGenerationFun = async () => {
    const rateRege = /^(1[0-5]|[0-9])$/;

    if (!rateRege.test(maxGeneration)) {
      return toast.error("请输入正确的收益代数");
    }

    setMaxGenerationLoading(true);
    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "setMaxGeneration",
      maxGeneration
    )
      .then(() => {
        toast.success("设置成功");
      })
      .catch(() => {
        toast.error("设置失败");
      })
      .finally(() => {
        setMaxGenerationLoading(false);
      });
  };

  const [nowGeneration, setNowGeneration] = useState("");

  const getMaxGeneration = async () => {
    const res = await getContract(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "maxGeneration"
    );

    setNowGeneration(res.toString());
  };

  useEffect(() => {
    getMaxGeneration();
  }, [stakingContractAddress, version]);

  const [blacklist, setBlacklist] = useState("");

  const [blacklistLoading, setBlacklistLoading] = useState(false);

  const [status, setStatus] = useState();

  const setBlacklistFun = async (isDo) => {
    if (!ethers.utils.isAddress(blacklist)) {
      return toast.error("请输入正确黑名单地址");
    }

    setStatus(isDo);

    setBlacklistLoading(true);

    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "setBlacklist",
      blacklist,
      isDo
    )
      .then(() => {
        toast.success("设置成功");
      })
      .catch(() => {
        toast.error("设置失败");
      })
      .finally(() => {
        setBlacklistLoading(false);
      });
  };

  const [minDirectFriendsNums, setMinDirectFriendsNums] = useState("");

  const [minDirectFriendsNumsLoading, setMinDirectFriendsNumsLoading] =
    useState(false);

  const setMinDirectFriendsNumsFun = async () => {
    const rateRege = /^(1[0-5]|[0-9])$/;

    if (!rateRege.test(minDirectFriendsNums)) {
      return toast.error("请输入正确的波比直推门限人数");
    }

    setMinDirectFriendsNumsLoading(true);
    await getWriteContractLoad(
      stakingContractAddress,
      version === 2 ? stakeAbiV2 : stakeAbi,
      "setMinDirectFriendsNums",
      minDirectFriendsNums
    )
      .then(() => {
        toast.success("设置成功");
      })
      .catch(() => {
        toast.error("设置失败");
      })
      .finally(() => {
        setMinDirectFriendsNumsLoading(false);
      });
  };

  return (
    <div className="bg-black min-h-screen text-white ">
      <AdminHeader />
      <div className="p-[20px]">
        <div className="flex items-center justify-center">
          <Link to="/admin">
            <GoBack className="mr-auto w-[24px] h-[24px]" />
          </Link>
          <div className="flex-1 text-[18px] font-bold pr-[12px] text-center">
            操作合约
          </div>
        </div>
        <div className="adminCard w-full mt-[20px] py-[30px] px-[16px] text-black">
          <div className="text-[16px] font-bold">转移OWNER地址</div>
          <div className="mt-[10px]">
            <input
              type="text"
              value={transferOwnerAddress}
              className="bg-white rounded-[55px] px-[20px] h-[40px] w-full text-[14px] border border-solid border-black"
              placeholder="请输入地址"
              onChange={(e) => setTransferOwnerAddress(e.target.value)}
            />
          </div>
          <Button
            onClick={transferOwner}
            loading={transferLoading}
            className="rounded-[55px] h-[40px] w-full bg-black text-[#98E23C] text-[14px] mt-[10px] border-0"
          >
            <span className="flex items-center justify-center gap-1">
              <Hot className="w-[24px] h-[24px]" />
              <span>转移</span>
            </span>
          </Button>
        </div>
        <div className="adminCard adminCard2 w-full mt-[20px] py-[30px] px-[16px] text-black">
          <div className="text-[16px] font-bold">设置代数收益比例</div>
          <div className="mt-[10px]">
            <input
              type="text"
              value={rewardNumber}
              className="bg-white rounded-[55px] px-[20px] h-[40px] w-full text-[14px] border border-solid border-black"
              placeholder="请输入代数 1-15"
              onChange={(e) => setRewardNumber(e.target.value)}
            />
          </div>
          <div className="mt-[10px]">
            <input
              type="text"
              value={rewardRate}
              className="bg-white rounded-[55px] px-[20px] h-[40px] w-full text-[14px] border border-solid border-black"
              placeholder="请输入比例 1-100"
              onChange={(e) => setRewardRate(e.target.value)}
            />
          </div>
          <Button
            onClick={setRewardRateFun}
            loading={rewardRateLoading}
            className="rounded-[55px] h-[40px] w-full bg-black text-[#98E23C] text-[14px] mt-[10px] border-0"
          >
            <span className="flex items-center justify-center gap-1">
              <Setting className="w-[24px] h-[24px]" />
              <span>设置</span>
            </span>
          </Button>
        </div>
        {version === 2 && (
          <div className="adminCard adminCard3 w-full mt-[20px] py-[30px] px-[16px] text-black">
            <div className="text-[16px] font-bold">设置静态每日收益率</div>
            <div className="mt-[10px]">
              <input
                type="text"
                value={dailyRewardRate}
                className="bg-white rounded-[55px] px-[20px] h-[40px] w-full text-[14px] border border-solid border-black"
                placeholder="请输入收益率"
                onChange={(e) => setDailyRewardRate(e.target.value)}
              />
            </div>
            <Button
              loading={dailyRewardRateLoading}
              onClick={setDailyRewardRateFun}
              className="rounded-[55px] h-[40px] w-full bg-black text-[#98E23C] text-[14px] mt-[10px] border-0"
            >
              <span className="flex items-center justify-center gap-1">
                <Setting className="w-[24px] h-[24px]" />
                <span>设置</span>
              </span>
            </Button>
          </div>
        )}
        <div className="adminCard adminCard4 w-full mt-[20px] py-[30px] px-[16px] text-black">
          <div className="text-[16px] font-bold">设置收益代数</div>
          <div className="text-[#27B53D] font-bold text-[14px] mt-[10px] flex gap-2">
            <span>当前代数:</span>
            <span>{nowGeneration}</span>
          </div>
          <div className="mt-[10px]">
            <input
              type="text"
              value={maxGeneration}
              className="bg-white rounded-[55px] px-[20px] h-[40px] w-full text-[14px] border border-solid border-black"
              placeholder="请输入收益代数"
              onChange={(e) => setMaxGeneration(e.target.value)}
            />
          </div>
          <Button
            loading={maxGenerationLoading}
            onClick={setMaxGenerationFun}
            className="rounded-[55px] h-[40px] w-full bg-black text-[#98E23C] text-[14px] mt-[10px] border-0"
          >
            <span className="flex items-center justify-center gap-1">
              <Setting className="w-[24px] h-[24px]" />
              <span>设置</span>
            </span>
          </Button>
        </div>

        {version === 2 && (
          <div className="adminCard adminCard5 w-full mt-[20px] py-[30px] px-[16px] text-black">
            <div className="text-[16px] font-bold">设置黑名单</div>
            <div className="mt-[10px]">
              <input
                type="text"
                value={blacklist}
                className="bg-white rounded-[55px] px-[20px] h-[40px] w-full text-[14px] border border-solid border-black"
                placeholder="请输入黑名单地址"
                onChange={(e) => setBlacklist(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                loading={blacklistLoading && status}
                onClick={() => setBlacklistFun(true)}
                className="rounded-[55px] h-[40px] w-full bg-black text-[#98E23C] text-[14px] mt-[10px] border-0"
              >
                <span className="flex items-center justify-center gap-1">
                  <Setting className="w-[24px] h-[24px]" />
                  <span>设置</span>
                </span>
              </Button>
              <Button
                loading={blacklistLoading && !status}
                onClick={() => setBlacklistFun(false)}
                className="rounded-[55px] h-[40px] w-full bg-black text-[#98E23C] text-[14px] mt-[10px] border-0"
              >
                <span className="flex items-center justify-center gap-1">
                  <Cancel className="w-[24px] h-[24px]" />
                  <span>取消</span>
                </span>
              </Button>
            </div>
          </div>
        )}
        <div className="adminCard adminCard6  w-full mt-[20px] py-[30px] px-[16px] text-black">
          <div className="text-[16px] font-bold">设置波比直推门限人数</div>
          <div className="mt-[10px]">
            <input
              type="text"
              value={minDirectFriendsNums}
              className="bg-white rounded-[55px] px-[20px] h-[40px] w-full text-[14px] border border-solid border-black"
              placeholder="请输入波比直推门限人数 0-15"
              onChange={(e) => setMinDirectFriendsNums(e.target.value)}
            />
          </div>
          <Button
            loading={minDirectFriendsNumsLoading}
            onClick={setMinDirectFriendsNumsFun}
            className="rounded-[55px] h-[40px] w-full bg-black text-[#98E23C] text-[14px] mt-[10px] border-0"
          >
            <span className="flex items-center justify-center gap-1">
              <Setting className="w-[24px] h-[24px]" />
              <span>设置</span>
            </span>
          </Button>
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
        className={"text-[14px] font-bold !text-[#98e23c]"}
      />
    </div>
  );
};

export default Contract;
