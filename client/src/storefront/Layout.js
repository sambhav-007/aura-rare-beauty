import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import WhatsAppFab from "./WhatsAppFab";

// bare = let content sit under the transparent fixed nav (used by the Home hero).
const Layout = ({ children, bare = false }) => (
  <div className="flex flex-col min-h-screen bg-cream">
    <Navbar />
    <CartDrawer />
    <main className="flex-grow" style={{ paddingTop: bare ? 0 : 104 }}>
      {children}
    </main>
    <Footer />
    <WhatsAppFab />
  </div>
);

export default Layout;
