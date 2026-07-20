import { Outlet, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar.js";
import { Footer } from "./components/Footer.js";
import { Landing } from "./pages/landing/Landing.js";
import { Comprar } from "./pages/compra/Comprar.js";
import { Pago } from "./pages/compra/Pago.js";
import { Gracias } from "./pages/compra/Gracias.js";
import { AdminLogin } from "./pages/admin/Login.js";
import { AdminLayout } from "./components/AdminLayout.js";
import { AdminDashboard } from "./pages/admin/Dashboard.js";
import { AdminSolicitudes } from "./pages/admin/Solicitudes.js";
import { AdminSolicitudDetalle } from "./pages/admin/SolicitudDetalle.js";
import { AdminConfiguracion } from "./pages/admin/Configuracion.js";

const isAdminSubdomain = window.location.hostname.startsWith("admin.");

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-navy-900">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="solicitudes" element={<AdminSolicitudes />} />
        <Route path="solicitudes/:id" element={<AdminSolicitudDetalle />} />
        <Route path="configuracion" element={<AdminConfiguracion />} />
      </Route>
    </Routes>
  );
}

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="comprar" element={<Comprar />} />
        <Route path="pago" element={<Pago />} />
        <Route path="gracias" element={<Gracias />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return isAdminSubdomain ? <AdminRoutes /> : <PublicRoutes />;
}
