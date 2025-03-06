import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <div className="w-full fixed bottom-0 left-0 h-[48px] flex items-center justify-around bg-[#eeeeee] text-[14px] text-black">
      <Link
        to="/"
        className={`font-bold ${
          location.pathname === "/" ? "text-black" : "text-[#929292]"
        }`}
      >
        {t("home")}
      </Link>
      <Link
        to="/invite"
        className={`font-bold ${
          location.pathname === "/invite" ? "text-black" : "text-[#929292]"
        }`}
      >
        {t("invite")}
      </Link>
    </div>
  );
};

export default Footer;
