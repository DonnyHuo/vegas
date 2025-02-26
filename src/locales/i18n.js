import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationEN from "./en.json";
import translationZH from "./zh.json";

const resources = {
  en: {
    translation: translationEN,
  },
  zh: {
    translation: translationZH,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // 默认语言
  fallbackLng: "en", // 回退语言
  interpolation: {
    escapeValue: false, // React 已经处理了转义
  },
});

export default i18n;
