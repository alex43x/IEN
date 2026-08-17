import { createBrowserRouter, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";
import AdminPatients from "./AdminPatients";
import AdminPatientDetail from "./AdminPatientDetail";
import AdminReports from "./AdminReports";
import AdminStores from "./AdminStores";
import AdminProducts from "./AdminProducts";
import AdminCodes from "./AdminCodes";
import AdminEmails from "./AdminEmails";
import AdminUsuarios from "./AdminUsuarios";
import Login from "./Login";
import Register from "./Register";
import Bienvenida from "./Bienvenida";
import Activar from "./Activar";
import Horario from "./Horario";
import Lectura from "./Lectura";
import BloqueIntro from "./BloqueIntro";
import Preguntas from "./Preguntas";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute";
import AdminLayout from "../components/layout/AdminLayout";
import PatientLayout from "../components/layout/PatientLayout";
import Cuenta from "./Cuenta";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import PublicRoute from "../components/PublicRoute";

function AdminIndex() {
  const { user } = useAuth();
  const target = user?.rol === "moderador_tienda" ? "/admin/productos" : "/admin/dashboard";
  return <Navigate to={target} replace />;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
  { path: "/activar", element: <Activar /> },
  { path: "/horario", element: <Horario /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/bienvenida", element: <Bienvenida /> },
      { path: "/lectura", element: <Lectura /> },
      { path: "/lectura/:diaNumero", element: <Lectura /> },
      { path: "/bloque-intro", element: <BloqueIntro /> },
      { path: "/preguntas", element: <Preguntas /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PatientLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/cuenta", element: <Cuenta /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <AdminIndex /> },
          { path: "/admin/dashboard", element: <AdminDashboard /> },
          { path: "/admin/pacientes", element: <AdminPatients /> },
          { path: "/admin/pacientes/:id", element: <AdminPatientDetail /> },
          { path: "/admin/reportes", element: <AdminReports /> },
          { path: "/admin/sucursales", element: <AdminStores /> },
          { path: "/admin/productos", element: <AdminProducts /> },
          { path: "/admin/codigos", element: <AdminCodes /> },
          { path: "/admin/plantillas", element: <AdminEmails /> },
          { path: "/admin/usuarios", element: <AdminUsuarios /> },
        ],
      },
    ],
  },
]);
