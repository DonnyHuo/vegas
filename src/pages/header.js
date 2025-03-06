import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import { ReactComponent as CopyMainColor } from "../../src/assets/img/copyMainColor.svg";
import { shortStr, connectWallet, copy } from "../../src/utils";

const Header = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const address = useSelector((state) => state.address);

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="w-full flex items-center justify-between text-[#98e23c] bg-black px-[20px] py-[10px]">
      <div>
        {i18n.language === "en" && (
          <button className="text-[14px]" onClick={() => changeLanguage("zh")}>
            繁体中文
          </button>
        )}
        {i18n.language === "zh" && (
          <button className="text-[14px]" onClick={() => changeLanguage("en")}>
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
  );
};

export default Header;
