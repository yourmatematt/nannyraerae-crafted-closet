import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import { PageTransition } from "./components/PageTransition";
import { TawkWidget } from "./components/TawkWidget";
import { StripeProvider } from "./components/StripeProvider";
import { ReservationManager } from "./components/ReservationManager";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewArrivals from "./pages/NewArrivals";
import ShopByAge from "./pages/ShopByAge";
import ShopByAgeOverview from "./pages/ShopByAgeOverview";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import About from "./pages/About";
import Gifts from "./pages/Gifts";
import FirstBirthday from "./pages/gifts/FirstBirthday";
import NewBaby from "./pages/gifts/NewBaby";
import Christmas from "./pages/gifts/Christmas";
import Easter from "./pages/gifts/Easter";
import StartingSchool from "./pages/gifts/StartingSchool";
import BigSibling from "./pages/gifts/BigSibling";
import GardenParty from "./pages/collections/GardenParty";
import ModernVintage from "./pages/collections/ModernVintage";
import RainbowBright from "./pages/collections/RainbowBright";
import CoastalDreams from "./pages/collections/CoastalDreams";
import SpringAwakening from "./pages/collections/SpringAwakening";
import SummerAdventures from "./pages/collections/SummerAdventures";
import CoordinatingSiblings from "./pages/collections/CoordinatingSiblings";
import FirstWardrobe from "./pages/collections/FirstWardrobe";
import SpecialOccasions from "./pages/collections/SpecialOccasions";
import EcoConscious from "./pages/collections/EcoConscious";
import Cart from "./pages/Cart";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import Checkout from "./pages/Checkout";
import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import { AddProduct } from "./pages/admin/AddProduct";
import AdminMessages from "./pages/admin/Messages";
import ProtectedRoute from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StripeProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <TawkWidget />
              <ReservationManager />
              <PageTransition>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
              <Route path="/shop-by-age" element={<ShopByAgeOverview />} />
              <Route path="/shop/age/:ageGroup" element={<ShopByAge />} />
              <Route path="/collection" element={<Collections />} />
              <Route path="/collections/:collectionName" element={<CollectionDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/gifts" element={<Gifts />} />

              {/* Gift Category Routes */}
              <Route path="/gifts/first-birthday" element={<FirstBirthday />} />
              <Route path="/gifts/new-baby" element={<NewBaby />} />
              <Route path="/gifts/christmas" element={<Christmas />} />
              <Route path="/gifts/easter" element={<Easter />} />
              <Route path="/gifts/starting-school" element={<StartingSchool />} />
              <Route path="/gifts/big-sibling" element={<BigSibling />} />

              {/* Collection Routes */}
              <Route path="/collections/garden-party" element={<GardenParty />} />
              <Route path="/collections/modern-vintage" element={<ModernVintage />} />
              <Route path="/collections/rainbow-bright" element={<RainbowBright />} />
              <Route path="/collections/coastal-dreams" element={<CoastalDreams />} />
              <Route path="/collections/spring-awakening" element={<SpringAwakening />} />
              <Route path="/collections/summer-adventures" element={<SummerAdventures />} />
              <Route path="/collections/coordinating-siblings" element={<CoordinatingSiblings />} />
              <Route path="/collections/first-wardrobe" element={<FirstWardrobe />} />
              <Route path="/collections/special-occasions" element={<SpecialOccasions />} />
              <Route path="/collections/eco-conscious" element={<EcoConscious />} />

              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/new" element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              } />
              <Route path="/admin/messages" element={
                <ProtectedRoute>
                  <AdminMessages />
                </ProtectedRoute>
              } />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </StripeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
