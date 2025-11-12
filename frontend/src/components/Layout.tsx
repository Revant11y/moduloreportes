import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Sidebar />
      <div className="main-content">
        <div className="page-content fade-in-up">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;