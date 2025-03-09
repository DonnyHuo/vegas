import AdminContract from "../adminPages/contract";
import AdminHome from "../adminPages/home";
import Home from "../pages/home";
import Invite from "../pages/invite";

const routes = [
  {
    path: "/",
    element: <Home />,
    showHeaderFooter: true
  },
  {
    path: "/invite",
    element: <Invite />,
    showHeaderFooter: true
  },
  {
    path: "/admin",
    element: <AdminHome />,
    showHeaderFooter: false
  },
  {
    path: "/admin/contract",
    element: <AdminContract />,
    showHeaderFooter: false
  }
];

export default routes;
