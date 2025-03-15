import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { ReactComponent as CopyMainColor } from "../../src/assets/img/copyMainColor.svg";
import { ReactComponent as Lan } from "../../src/assets/img/lan.svg";
import useWalletListener from "../../src/hooks/useWalletListener";
import { shortStr, connectWallet, copy } from "../../src/utils";

const Header = () => {
  useWalletListener();

  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const address = useSelector((state) => state.address);

  useEffect(() => {
    connectWallet();
  }, []);

  const lanList = [
    {
      label: "English",
      value: "en"
    },
    {
      label: "简体中文",
      value: "zh"
    },
    {
      label: "日本語",
      value: "ja"
    },
    {
      label: "한국어",
      value: "ko"
    }
  ];

  const [showLan, setShowLan] = useState(false);

  const divRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (divRef.current && !divRef.current.contains(event.target)) {
        setShowLan(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full flex items-center justify-between text-white bg-black px-[20px] py-[10px]">
      <div className="flex items-center gap-2">
        <Lan
          className="w-5 h-5"
          onClick={() => setShowLan((pre) => (pre = !pre))}
        />
        {showLan && (
          <div
            ref={divRef}
            className="absolute top-[42px] left-2 bg-black text-[12px] p-3 rounded-xl flex flex-col gap-2"
          >
            {lanList.map((list) => {
              return (
                <div
                  key={list.value}
                  className={`${
                    i18n.language === list.value && `text-[#98e23c]`
                  }`}
                  onClick={() => {
                    changeLanguage(list.value);
                    setTimeout(() => {
                      setShowLan(false);
                    }, 100);
                  }}
                >
                  {list.label}
                </div>
              );
            })}
          </div>
        )}
        {/* {["zh-CN"].includes(i18n.language) ? (
          <button className="text-[14px]" onClick={() => changeLanguage("en")}>
            English
          </button>
        ) : (
          <button
            className="text-[14px]"
            onClick={() => changeLanguage("zh-CN")}
          >
            简体中文
          </button>
        )} */}

        <Link className="text-[12px] text-[#98e23c]" to="/introduction">
          {t("foundationIntroduction")}
        </Link>
      </div>
      <div>
        {address ? (
          <div className="flex items-center gap-1 text-[14px] text-[#98e23c]">
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
