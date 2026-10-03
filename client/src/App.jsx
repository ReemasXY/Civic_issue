import { useEffect } from "react";
import axios from "axios";
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
import Reviews from "./pages/Citizen/Reviews";
import OfficerProfile from "./pages/Officer/OfficerProfile";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOfficers from "./pages/Admin/AdminOfficers";

function App() {
  // Setup axios interceptors to handle authentication errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status } = error.response;

          // Redirect to login on 401 (unauthorized) or 403 (forbidden - deactivated account)
          if ((status === 401 || status === 403) && !window.location.pathname.includes("/login")) {
            console.log("Authentication failed, redirecting to login...");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => axios.interceptors.response.eject(interceptor);
  }, []);
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
        {
          path: "reviews",
          element: <Reviews />,
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
        {
          path: "profile",
          element: <OfficerProfile />,
        },
      ],
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "overview",
          element: <AdminDashboard />,
        },
        {
          path: "officers",
          element: <AdminOfficers />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;