import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  useIonToast,
  IonSpinner,
} from "@ionic/react";
import {
  arrowForwardOutline,
  barbellOutline,
  bodyOutline,
  flameOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useHistory } from "react-router-dom";

const Onboarding: React.FC = () => {
  const { user, setUser } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  const [step, setStep] = useState(1);
  const [objetivo, setObjetivo] = useState(
    user?.objetivo || "Aumento de Masa Muscular",
  );
  const [somatotipo, setSomatotipo] = useState(user?.somatotipo || "Ectomorfo");
  const [isLoading, setIsLoading] = useState(false);

  const finalizarOnboarding = async () => {
    setIsLoading(true);
    try {
      // Guardamos en PostgreSQL
      await api.put(`/update-profile/${user?.id}`, { objetivo, somatotipo });

      // Actualizamos el estado global en React
      const newUser = { ...user!, objetivo, somatotipo };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));

      present({
        message: "¡Perfil configurado con éxito!",
        duration: 2000,
        color: "success",
      });
      history.replace('/app/Dashboard');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      present({
        message: "Error al guardar. Intenta de nuevo.",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saltar = () => {
    history.replace('/app/Dashboard');
  };

  return (
    <IonPage>
      <IonContent
        className="ion-padding"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Barra superior de progreso y saltar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          {step === 2 ? (
            <IonButton fill="clear" onClick={() => setStep(1)}>
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          ) : (
            <div></div>
          )}
          <IonButton fill="clear" color="medium" onClick={saltar}>
            Saltar
          </IonButton>
        </div>

        <div
          className="ion-text-center"
          style={{ marginTop: "5vh", marginBottom: "30px" }}
        >
          <IonText color="primary">
            <h1 style={{ fontWeight: "bold" }}>Paso {step} de 2</h1>
          </IonText>
          <p style={{ color: "var(--ion-color-medium)" }}>
            Personaliza tu experiencia en FitnessAhora
          </p>
        </div>

        {/* PASO 1: OBJETIVO */}
        {step === 1 && (
          <div>
            <h2 className="ion-text-center" style={{ marginBottom: "20px" }}>
              ¿Cuál es tu meta principal?
            </h2>

            <IonCard
              color={
                objetivo === "Aumento de Masa Muscular" ? "primary" : "light"
              }
              onClick={() => setObjetivo("Aumento de Masa Muscular")}
              style={{ cursor: "pointer", transition: "0.3s" }}
            >
              <IonCardContent
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <IonIcon icon={barbellOutline} style={{ fontSize: "2.5rem" }} />
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      color:
                        objetivo === "Aumento de Masa Muscular"
                          ? "white"
                          : "black",
                    }}
                  >
                    Ganar Masa Muscular
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color:
                        objetivo === "Aumento de Masa Muscular"
                          ? "#e0e0e0"
                          : "gray",
                    }}
                  >
                    Rutinas de hipertrofia y volumen
                  </p>
                </div>
              </IonCardContent>
            </IonCard>

            <IonCard
              color={objetivo === "Bajar de peso" ? "primary" : "light"}
              onClick={() => setObjetivo("Bajar de peso")}
              style={{ cursor: "pointer", transition: "0.3s" }}
            >
              <IonCardContent
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <IonIcon icon={flameOutline} style={{ fontSize: "2.5rem" }} />
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      color: objetivo === "Bajar de peso" ? "white" : "black",
                    }}
                  >
                    Perder Grasa
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: objetivo === "Bajar de peso" ? "#e0e0e0" : "gray",
                    }}
                  >
                    Déficit calórico y definición
                  </p>
                </div>
              </IonCardContent>
            </IonCard>

            <IonButton
              expand="block"
              style={{ marginTop: "30px" }}
              onClick={() => setStep(2)}
            >
              Siguiente <IonIcon icon={arrowForwardOutline} slot="end" />
            </IonButton>
          </div>
        )}

        {/* PASO 2: SOMATOTIPO */}
        {step === 2 && (
          <div>
            <h2 className="ion-text-center" style={{ marginBottom: "20px" }}>
              ¿Cuál es tu tipo de cuerpo?
            </h2>

            {["Ectomorfo", "Mesomorfo", "Endomorfo"].map((tipo) => (
              <IonCard
                key={tipo}
                color={somatotipo === tipo ? "primary" : "light"}
                onClick={() => setSomatotipo(tipo)}
                style={{ cursor: "pointer", transition: "0.3s" }}
              >
                <IonCardContent
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <IonIcon icon={bodyOutline} style={{ fontSize: "2rem" }} />
                  <h3
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      color: somatotipo === tipo ? "white" : "black",
                    }}
                  >
                    {tipo}
                  </h3>
                </IonCardContent>
              </IonCard>
            ))}

            <IonButton
              expand="block"
              style={{ marginTop: "30px" }}
              onClick={finalizarOnboarding}
              disabled={isLoading}
            >
              {isLoading ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  Finalizar y Entrar{" "}
                  <IonIcon icon={checkmarkCircleOutline} slot="end" />
                </>
              )}
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;
