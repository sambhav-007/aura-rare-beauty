import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { SettingsProvider } from "./context/SettingsContext";
import { CartProvider } from "./context/CartContext";
import AdminProtectedRoute from "./components/shop/auth/AdminProtectedRoute";
import TopLoader from "./storefront/TopLoader";
import ScrollToTop from "./storefront/ScrollToTop";

// Storefront
import Home from "./storefront/pages/Home";
import Collections from "./storefront/pages/Collections";
import Category from "./storefront/pages/Category";
import Product from "./storefront/pages/Product";
import Search from "./storefront/pages/Search";
import Cart from "./storefront/pages/Cart";
import Checkout from "./storefront/pages/Checkout";
import AdminLogin from "./storefront/pages/AdminLogin";
import NotFound from "./storefront/pages/NotFound";

// Admin
import {
  DashboardAdmin,
  Categories,
  Products,
  ShadeManager,
  Banners,
  Reviews,
  Settings,
} from "./components/admin";

function App() {
  return (
    <SettingsProvider>
      <CartProvider>
        <TopLoader />
        <Router>
          <ScrollToTop />
          <Switch>
            {/* Storefront */}
            <Route exact path="/" component={Home} />
            <Route exact path="/category" component={Collections} />
            <Route exact path="/category/:slug" component={Category} />
            <Route exact path="/product/:slug" component={Product} />
            <Route exact path="/search" component={Search} />
            <Route exact path="/cart" component={Cart} />
            <Route exact path="/checkout" component={Checkout} />

            {/* Admin */}
            <Route exact path="/admin/login" component={AdminLogin} />
            <AdminProtectedRoute exact path="/admin/dashboard" component={DashboardAdmin} />
            <AdminProtectedRoute exact path="/admin/dashboard/categories" component={Categories} />
            <AdminProtectedRoute exact path="/admin/dashboard/products" component={Products} />
            <AdminProtectedRoute
              exact
              path="/admin/dashboard/products/:id/shades"
              component={ShadeManager}
            />
            <AdminProtectedRoute exact path="/admin/dashboard/banners" component={Banners} />
            <AdminProtectedRoute exact path="/admin/dashboard/reviews" component={Reviews} />
            <AdminProtectedRoute exact path="/admin/dashboard/settings" component={Settings} />

            <Route component={NotFound} />
          </Switch>
        </Router>
      </CartProvider>
    </SettingsProvider>
  );
}

export default App;
