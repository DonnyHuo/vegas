import { ethers } from "ethers";
import moment from "moment";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

import erc20Abi from "../../src/assets/abi/erc20.json";
import stakeAbi from "../../src/assets/abi/stakingContract.json";
import stakeAbiV2 from "../../src/assets/abi/stakingContractV2.json";
import { ReactComponent as Copy } from "../../src/assets/img/copy.svg";
import { ReactComponent as Hello } from "../../src/assets/img/hello.svg";
import { ReactComponent as Money2 } from "../../src/assets/img/money2.svg";
import { copy, getContract, shortStr } from "../../src/utils";
import { fetchData } from "../http/request";

const Invite = () => {
  const { t } = useTranslation();

  const address = useSelector((state) => state.address);

  const version = useSelector((state) => state.version);

  const usdtAddress = useSelector((state) => state.usdtAddress);

  const stakingContractAddress = useSelector((state) =>
    version === 2
      ? state.stakingContractAddressV2
      : version === 3
      ? state.stakingContractAddressV3
      : state.stakingContractAddress
  );

  const [referrer, setReferrer] = useState(ethers.constants.AddressZero);

  const [staked, setStaked] = useState(false);

  const getUsers = useCallback(async () => {
    const amounts = await getContract(
      stakingContractAddress,
      [2, 3].includes(version) ? stakeAbiV2 : stakeAbi,
      "users",
      address
    );
    setReferrer(amounts.referrer);
    setStaked(amounts.totalStaked.toString() * 1 > 0);
  }, [stakingContractAddress, address, version]);

  const [rewardToken, setRewardToken] = useState();

  const getRewardTokenInfo = async () => {
    const rewardToken = await getContract(usdtAddress, erc20Abi, "symbol");
    setRewardToken(rewardToken);
  };

  useEffect(() => {
    if (address) {
      getUsers();
    }
    getRewardTokenInfo();
  }, [address, getUsers]);

  const referrerShow = useMemo(() => {
    return referrer !== ethers.constants.AddressZero;
  }, [referrer]);

  const inviteLink = useMemo(() => {
    return `${window.location.origin}?invite=${address}&version=${version}`;
  }, [address, version]);

  const [info, setInfo] = useState({});

  const getList = async (address) => {
    const data = `query {
            user(id: "${address}"){
                teamSize
                referrer{
                    id
                }
                referrals{
                    id 
                }
                teamSize
                stakedAmount
                totalRefferRewards
                claimedRewards
                contributions(orderBy: timestamp, orderDirection: desc,first:20){
                    id 
                    contributor{
                        id
                    }
                generation
                amount
                referralRecord{
                    transactionHash
                }
                timestamp
            }   
        }
    }`;
    const res = await fetchData(data);

    const inviteInfo = res?.user;

    setInfo(inviteInfo);
  };

  useEffect(() => {
    if (address) {
      getList(address);
    }
  }, [address]);

  return (
    <div className="p-[20px] content-box invite-bg">
      <div className="font-bold mt-[10px] mb-[20px] text-center text-[18px]">
        {t("welcome")}
      </div>
      <div className="bg-black rounded-lg w-full px-[20px] pb-[20px] mt-[60px]">
        <div className="flex justify-between relative">
          <Money2 className="-mt-12 absolute -top-[10px] left-0" />
          <div></div>
          <div className="text-white text-right">
            <div>
              {t("myTeam")}{" "}
              <span className="text-[#FFC300] text-[40px] font-bold">
                {info?.teamSize ?? 0}
              </span>
              人
            </div>
            <div>
              {t("directInvitation")}{" "}
              <span className="text-[#FFC300] text-[40px] font-bold">
                {info?.referrals?.length ?? 0}
              </span>
              人
            </div>
          </div>
        </div>
        <div className="text-[#98E23C] text-[16px] font-bold">
          {t("totalEarnings")}
        </div>
        <div className="text-[#98E23C] text-[28px] font-bold">
          {info?.totalRefferRewards
            ? (info?.totalRefferRewards / 10 ** 18).toFixed(2)
            : 0}{" "}
          {rewardToken}
        </div>
      </div>

      <div className="h-[140px] mt-[40px] p-[20px] bg-black rounded-lg border border-solid border-black">
        <div>
          <div className="h-[60px] text-[20px] font-bold text-white flex items-end justify-between">
            {t("inviteFriendReward")}
            <Hello className="-mt-[60px] flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between mt-3 gap-[20px]">
            {/* <GuideO fontSize={"20px"} /> */}
            <div className="truncate text-white text-[14px]">{inviteLink}</div>
            <button
              className="text-white border border-solid border-white rounded-[8px] text-[12px] flex-shrink-0 px-2 py-1"
              onClick={() => {
                if (!address) {
                  return toast.error(t("connectWallet"));
                }
                if (!staked) {
                  return toast.error(t("shareTips"));
                }
                copy(inviteLink);
                toast.success(t("copySuccess"));
              }}
            >
              {t("copyLink")}
            </button>
          </div>
        </div>
      </div>

      {referrerShow && (
        <div className="w-full border border-solid border-black mt-[20px] rounded-lg p-[20px] bg-white">
          <span className="text-[16px] font-bold mt-[20px]">
            {t("myInviter")}
          </span>

          <div className="text-[14px] flex items-center justify-between mt-2">
            <span className="w-11/12 truncate">{referrer}</span>
            <Copy
              onClick={() => {
                copy(referrer);
                toast.success(t("copySuccess"));
              }}
              className="w-4 h-4"
            />
          </div>
        </div>
      )}
      <div className="w-full border border-solid border-black my-[20px] rounded-lg p-[20px] bg-white">
        <div className="text-[16px] font-bold mb-[20px]">
          {t("invitationRewardRecord")}
        </div>
        {info?.contributions?.length ? (
          <>
            {info?.contributions?.map((list) => {
              return (
                <div className="border-0 border-b border-solid border-[#D8D8D8] py-[10px] relative last:border-b-0">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[14px]">{t("address")}</span>
                    <span className="text-[14px] flex items-center gap-1">
                      {shortStr(list.contributor.id)}
                      <Copy
                        onClick={() => {
                          copy(list.contributor.id);
                          toast.success(t("copySuccess"));
                        }}
                        className="w-4 h-4"
                      />
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[14px]">{t("amount")}</span>
                    <span>
                      <span className="text-[#27B53D] font-bold text-[18px]">
                        {list.amount / 10 ** 18}
                      </span>{" "}
                      <span className="text-[14px]">{rewardToken}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[14px]">{t("time")}</span>
                    <span className="text-[14px] text-[#767676]">
                      {moment(list.timestamp * 1000).format(
                        "YYYY-MM-DD HH:mm:ss"
                      )}
                    </span>
                  </div>
                  <div className="absolute top-[20px] left-[100px]">
                    <img
                      className="w-[60px] h-[70px]"
                      src={require(`../assets/img/15/${list?.generation}.png`)}
                      alt=""
                    />
                  </div>
                </div>
              );
            })}
          </>
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
    </div>
  );
};
export default Invite;
