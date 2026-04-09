import { Outlet } from 'react-router-dom';

const ClientLayout = () => {
  return (
    <div>
      <header style={{ padding: '20px', background: '#ffe4e1' }}>Header của Khách Hàng (Logo, Menu Đặt lịch...)</header>
      
      {/* Outlet chính là nơi nội dung các trang con (như Home) sẽ hiển thị */}
      <main style={{ padding: '20px', minHeight: '70vh' }}>
        <Outlet />
      </main>
      
      <footer style={{ padding: '20px', background: '#333', color: 'white' }}>Footer của Khách Hàng</footer>
    </div>
  );
};
export default ClientLayout;