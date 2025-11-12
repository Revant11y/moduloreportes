import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Módulo de Reportes</h1>
        <div className="header-actions">
          <span className="user-info">Admin Dashboard</span>
        </div>
      </div>
    </header>
  );
};

export default Header;