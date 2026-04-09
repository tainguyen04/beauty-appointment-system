import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Client/Home';
import Dashboard from './pages/Admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LUỒNG 1: DÀNH CHO KHÁCH HÀNG (Domain chính: localhost:5173/ ) */}
        <Route path="/" element={<ClientLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* LUỒNG 2: DÀNH CHO ADMIN (Domain: localhost:5173/admin/... ) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;