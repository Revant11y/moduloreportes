import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, DollarSign, Users, GraduationCap, TrendingUp, UserCheck } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/sales-reports', label: 'Reportes de Ventas', icon: DollarSign },
    { path: '/user-reports', label: 'Usuarios Activos', icon: Users },
    { path: '/completion-reports', label: 'Finalizacion de Cursos', icon: GraduationCap },
    { path: '/instructor-courses', label: 'Cursos por Instructor', icon: UserCheck },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <TrendingUp className="sidebar-nav-icon" />
            ReportHub
          </div>
          <p className="sidebar-subtitle">Sistema de Reportes Administrativo</p>
        </div>
        
        <nav>
          <ul className="sidebar-nav">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="sidebar-nav-item">
                  <Link
                    to={item.path}
                    className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <IconComponent className="sidebar-nav-icon" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
