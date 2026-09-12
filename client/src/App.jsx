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
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;