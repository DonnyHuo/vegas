import { BrowserRouter, Routes, Route } from "react-router-dom";

import Footer from "../src/pages/footer";
import Header from "../src/pages/header";
import Home from "../src/pages/home";
import Invite from "../src/pages/invite";
// import { setupListeners } from "../src/utils";

import "./App.css";

function App() {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          {/* 定义路由 */}
          <Route path="/" element={<Home />} />
          <Route path="/invite" element={<Invite />} />
          {/* 404 页面 */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
