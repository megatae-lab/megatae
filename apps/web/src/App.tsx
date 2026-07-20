import { Outlet, Route, Routes, useLocation } from "react-router-dom";
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
import { useEffect } from "react";

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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="comprar" element={<Comprar />} />
          <Route path="pago" element={<Pago />} />
          <Route path="gracias" element={<Gracias />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="solicitudes" element={<AdminSolicitudes />} />
          <Route path="solicitudes/:id" element={<AdminSolicitudDetalle />} />
          <Route path="configuracion" element={<AdminConfiguracion />} />
        </Route>
      </Routes>
    </>
  );
}