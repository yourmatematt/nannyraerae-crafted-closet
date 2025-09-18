import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import NewArrivals from "./pages/NewArrivals";
import ShopByAge from "./pages/ShopByAge";
import Collections from "./pages/Collections";
import CollectionDetail from "./pages/CollectionDetail";
import About from "./pages/About";
import Gifts from "./pages/Gifts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/shop/age/:ageGroup" element={<ShopByAge />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:collectionName" element={<CollectionDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/gifts" element={<Gifts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
