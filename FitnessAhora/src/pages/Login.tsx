import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonText,
  IonIcon,
  useIonRouter,
  IonSpinner,
} from "@ionic/react";
import { logInOutline, personAddOutline, alertCircleOutline } from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useIonRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      const savedUser = JSON.parse(localStorage.getItem("fitness_user") || "{}");
      if (savedUser.somatotipo === "Por definir" || !savedUser.somatotipo) {
        router.push("/onboarding", "forward", "replace");
      } else {
        router.push("/app/dashboard", "forward", "replace");
      }
    } catch {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-content">
        {/* Background accent */}
        <div className="login-bg-accent" />

        <div className="login-wrapper">
          {/* Logo + Brand */}
          <div className="login-brand">
            <div className="login-logo-ring">
              <img src="/assets/logo.png" alt="FitnessAhora" className="login-logo" />
            </div>
            <h1 className="login-title">FitnessAhora</h1>
            <p className="login-subtitle">Tu entrenamiento, tu progreso</p>
          </div>

          {/* Form Card */}
          <div className="login-card">
            <form onSubmit={handleLogin}>
              <div className="login-fields">
                <div className="field-group">
                  <label className="field-label">Correo electrónico</label>
                  <IonItem className="custom-item" lines="none">
                    <IonInput
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      required
                    />
                  </IonItem>
                </div>

                <div className="field-group">
                  <label className="field-label">Contraseña</label>
                  <IonItem className="custom-item" lines="none">
                    <IonInput
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      required
                    />
                  </IonItem>
                </div>
              </div>

              {error && (
                <div className="login-error">
                  <IonIcon icon={alertCircleOutline} />
                  <IonText>{error}</IonText>
                </div>
              )}

              <IonButton
                expand="block"
                type="submit"
                className="btn-primary-action"
                disabled={isLoading}
              >
                {isLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={logInOutline} slot="start" />
                    Iniciar Sesión
                  </>
                )}
              </IonButton>

              <div className="login-divider">
                <span>¿No tienes cuenta?</span>
              </div>

              <IonButton
                expand="block"
                fill="outline"
                className="btn-secondary-action"
                disabled={isLoading}
                onClick={() => router.push("/register", "forward", "push")}
              >
                <IonIcon icon={personAddOutline} slot="start" />
                Crear cuenta nueva
              </IonButton>
            </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;