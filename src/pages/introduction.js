import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import { ReactComponent as Copy } from "../../src/assets/img/copyWhite.svg";
import { ReactComponent as GoBack } from "../../src/assets/img/goBack.svg";
import { ReactComponent as IntroLogo } from "../../src/assets/img/introLogo.svg";
import { copy, shortStr } from "../utils";

const Introduction = () => {
  const { t } = useTranslation();

  const stakingContractAddressV2 = useSelector(
    (state) => state.stakingContractAddressV2
  );

  return (
    <div className="introduction">
      <div className="bg-[rgba(0,0,0,0.9)] min-h-[calc(100vh-44px)] p-[20px] text-white text-center text-[14px]">
        <Link to="/" className="flex items-center gap-1">
          <GoBack className="w-5 h-5" />
          <span className="text-[12px] text-[#98E23C]">
            {t("intro.backToHome")}
          </span>
        </Link>

        <div className="flex items-center justify-center mt-[30px]">
          <IntroLogo />
        </div>
        <div className="text-[26px] mt-[10px] shadow font-bold tracking-widest">
          {t("intro.title")}
        </div>
        <div className="mt-[15px]">
          <p>{t("intro.subtitle")[0]}</p>
          <p>{t("intro.subtitle")[1]}</p>
        </div>
        <div className="mt-[15px]">
          <p>{t("intro.description")[0]}</p>
          <p className="text-[#FF9500]">{t("intro.description")[1]}</p>
        </div>
        <div className="mt-[30px] leading-6">
          <p>{t("intro.about")}</p>
          <p>{t("intro.team")}</p>
        </div>

        <div className="mt-[30px] text-[12px]">
          <div className="text-[#FF9500]">{t("intro.details")}</div>
          <a className="text-[#FF9500]" href="/Vegas.pdf" download="Vegas.pdf">
            <button>Vegas.pdf</button>
          </a>
          <div className="mt-[10px]">{t("intro.officialDapp")}</div>
          <div className="flex items-center justify-center gap-2">
            <span>https://game.wwwvegas.net</span>
            <Copy
              onClick={() => {
                copy("https://game.wwwvegas.net");
                toast.success(t("copySuccess"));
              }}
            />
          </div>
          <div className="mt-[10px]">{t("intro.contractAddress")}</div>
          <div className="flex items-center justify-center gap-2">
            <span>{shortStr(stakingContractAddressV2)}</span>
            <Copy
              onClick={() => {
                copy(stakingContractAddressV2);
                toast.success(t("copySuccess"));
              }}
            />
          </div>
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

export default Introduction;
