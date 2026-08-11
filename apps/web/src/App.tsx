import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar.js";
import { Footer } from "./components/Footer.js";
import { Landing } from "./pages/landing/Landing.js";
import { LandingMovistar } from "./pages/landing/movistar/v1/LandingMovistar.js";
import { LandingBait } from "./pages/landing/bait/v1/LandingBait.js";
import { LandingAtt } from "./pages/landing/att/v1/LandingAtt.js";
import { Comprar } from "./pages/compra/Comprar.js";
import { ComprarAtt } from "./pages/landing/att/v1/ComprarAtt.js";
import { ComprarBait } from "./pages/landing/bait/v1/ComprarBait.js";
import { ComprarMovistar } from "./pages/landing/movistar/v1/ComprarMovistar.js";
import { Pago } from "./pages/compra/Pago.js";
import { Gracias } from "./pages/compra/Gracias.js";
import { Conocenos } from "./pages/conocenos/Conocenos.js";
import { AdminLogin } from "./pages/admin/Login.js";
import { PageLoader } from './components/PageLoader.js'
import { AdminLayout } from "./components/AdminLayout.js";
import { AdminDashboard } from "./pages/admin/Dashboard.js";
import { AdminSolicitudes } from "./pages/admin/Solicitudes.js";
import { AdminSolicitudDetalle } from "./pages/admin/SolicitudDetalle.js";
import { AdminConfiguracion } from "./pages/admin/Configuracion.js";
import { Registro } from "./pages/registro/Registro.js";
import { initAnalytics, trackPageView } from "./lib/analytics.js";
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

function AnalyticsTracker() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    trackPageView(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
}

export function App() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <>
      <ScrollToTop />
      <AnalyticsTracker />
      <PageLoader />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="conocenos" element={<Conocenos />} />
          <Route path="registro" element={<Registro />} />
          <Route path="comprar" element={<Comprar />} />
          <Route path="pago" element={<Pago />} />
          <Route path="gracias" element={<Gracias />} />
          <Route path="v1/eSIM-Movistar" element={<LandingMovistar />} />
          <Route path="v1/eSIM-Bait" element={<LandingBait />} />
          <Route path="v1/eSIM-Att" element={<LandingAtt />} />
          <Route path="v1/eSIM-Att/comprar" element={<ComprarAtt />} />
          <Route path="v1/eSIM-Bait/comprar" element={<ComprarBait />} />
          <Route path="v1/eSIM-Movistar/comprar" element={<ComprarMovistar />} />
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