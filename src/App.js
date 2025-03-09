import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation
} from "react-router-dom";
import Footer from "../src/pages/footer";
import Header from "../src/pages/header";
import routes from "./routers";

import "./App.css";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();

  const currentRoute = routes.find((route) => route.path === location.pathname);

  const showHeaderFooter = currentRoute ? currentRoute.showHeaderFooter : true;

  return (
    <div>
      {showHeaderFooter && <Header />}
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default App;
