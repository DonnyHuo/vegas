import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import { shortStr, connectWallet } from "../src/utils";

import "./App.css";

function App() {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const address = useSelector((state) => state.address);
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => changeLanguage("en")}>English</button>
          <button onClick={() => changeLanguage("zh")}>中文</button>
        </div>
        <div>
          {address ? (
            <div>{shortStr(address)}</div>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </div>
      <div className="text-center">{t("welcome")}</div>
    </>
  );
}

export default App;
