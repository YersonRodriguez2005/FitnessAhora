import { Route, Redirect } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { AuthProvider } from "./context/AuthContext";

// Importación de las Rutas Principales
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import MainTabs from "./pages/MainTabs";
import ProtectedRoute from './components/ProtectedRoute';

/* CSS Core de Ionic */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Tema Oscuro y Variables */
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => (
  <AuthProvider>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          
          {/* ==== RUTAS PÚBLICAS (Sin restricción) ==== */}
          <Route exact path="/login">
            <Login />
          </Route>

          <Route exact path="/register">
            <Register />
          </Route>

          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

          {/* ==== RUTAS PRIVADAS (Protegidas por token) ==== */}
          {/* Usamos la propiedad "component={...}" según configuramos en ProtectedRoute */}
          
          <ProtectedRoute exact path="/onboarding" component={Onboarding} />

          {/* Al proteger "/app", automáticamente protegemos todas las sub-rutas que viven dentro de MainTabs (Dashboard, Train, Profile, etc.) */}
          <ProtectedRoute path="/app" component={MainTabs} />

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </AuthProvider>
);

export default App;