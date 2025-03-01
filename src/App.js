import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../src/pages/home";
// import { setupListeners } from "../src/utils";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 定义路由 */}
        <Route path="/" element={<Home />} />
        {/* 404 页面 */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
