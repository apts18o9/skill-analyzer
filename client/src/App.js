import { BrowserRouter, Routes, Router, Route } from "react-router-dom"
import './App.css';
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Header from "./components/Header";
import ProfilePage from "./pages/ProfilePage";
function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#ffe5d9] min-h-screen">
        <Header />
        <main className="container mx-auto p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>

  );
}

export default App;
