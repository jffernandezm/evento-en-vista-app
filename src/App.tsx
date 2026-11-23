
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import EventDetailPage from "./pages/EventDetailPage";
import AuthPage from "./pages/AuthPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import FavoritesPage from "./pages/FavoritesPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import AuthHashHandler from "./components/AuthHashHandler";
import ConsentBanner from "./components/ConsentBanner";
import PrivacyPage from "./pages/PrivacyPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthHashHandler />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/edit-event/:id" element={<EditEventPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacidad" element={<PrivacyPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ConsentBanner />
      <Toaster />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
