import React from 'react';
import { 
  IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel 
} from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';
import { 
  homeOutline, barbellOutline, restaurantOutline, personOutline 
} from 'ionicons/icons';

// Importamos tus páginas de los tabs
import Dashboard from './Dashboard';
import Train from './Train';
import RutinaSemanal from './RutinaSemanal';
import Profile from './Profile';
import Nutrition from './Nutrition';

const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        
        {/* Rutas Principales de las Pestañas */}
        <Route exact path="/app/dashboard">
          <Dashboard />
        </Route>
        
        <Route exact path="/app/train">
          <Train />
        </Route>
        
        {/* Sub-ruta de Entrenamiento */}
        <Route exact path="/app/train/rutina">
          <RutinaSemanal />
        </Route>
        
        <Route exact path="/app/nutrition">
          <Nutrition />
        </Route>
        
        <Route exact path="/app/profile">
          <Profile />
        </Route>

        {/* Redirección por defecto al entrar a /app */}
        <Route exact path="/app">
          <Redirect to="/app/dashboard" />
        </Route>
        
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="dashboard" href="/app/dashboard">
          <IonIcon aria-hidden="true" icon={homeOutline} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="train" href="/app/train">
          <IonIcon aria-hidden="true" icon={barbellOutline} />
          <IonLabel>Entrenar</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="nutrition" href="/app/nutrition">
          <IonIcon aria-hidden="true" icon={restaurantOutline} />
          <IonLabel>Nutrición</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="profile" href="/app/profile">
          <IonIcon aria-hidden="true" icon={personOutline} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
      
    </IonTabs>
  );
};

export default MainTabs;