import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';

// Definimos las propiedades que recibirá nuestro componente
interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  // Buscamos si existe el token en el almacenamiento del dispositivo
  const token = localStorage.getItem('fitness_token');

  return (
    <Route
      {...rest}
      render={(props) => {
        if (token) {
          // Si hay token, lo dejamos pasar al componente solicitado (Dashboard, Perfil, etc.)
          return <Component {...props} />;
        } else {
          // Si NO hay token, lo redirigimos a la fuerza al Login
          return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default ProtectedRoute;