import Home from "./pages/Home/Home";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "./components/Layout";
import Login from "./pages/Login&Register/Login";
import CitizenLayout from "./pages/Citizen/CitizenLayout";
import Dashboard from "./pages/Citizen/Dashboard";
import ReportIssue from "./pages/Citizen/ReportIssue/ReportIssue";
import MyComplaints from "./pages/Citizen/MyComplaints/MyComplaints";
import OfficerLayout from "./pages/Officer/OfficerLayout";
import OfficerDashboard from "./pages/Officer/OfficerDashboard";
import AssignedComplaints from "./pages/Officer/AssignedComplaints";
import VerifiedComplaints from "./pages/Officer/VerifiedComplaints";
import Notifications from "./pages/Citizen/Notifications";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: "howitworks",
          element: <HowItWorks />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/citizen",
      element: <CitizenLayout />,
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "report",
          element: <ReportIssue />,
        },
        {
          path: "my-complaints",
          element: <MyComplaints />,
        },
        {
          path: "notifications",
          element: <Notifications />,
        },
      ],
    },
    {
      path: "/officer",
      element: <OfficerLayout />,
      children: [
        {
          path: "dashboard",
          element: <OfficerDashboard />,
        },
        {
          path: "complaints",
          element: <AssignedComplaints />,
        },
        {
          path: "verified-complaints",
          element: <VerifiedComplaints />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;