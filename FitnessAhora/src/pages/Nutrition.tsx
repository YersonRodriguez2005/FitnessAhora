import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonBadge,
  IonSkeletonText,
} from "@ionic/react";
import {
  restaurantOutline,
  flameOutline,
  pieChartOutline,
  waterOutline,
  timeOutline,
  leafOutline,
  fishOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface PlanNutricional {
  objetivo: string;
  somatotipo: string;
  calorias_base: number;
  proteina_porcentaje: number;
  carbos_porcentaje: number;
  grasas_porcentaje: number;
  ejemplo_desayuno: string;
  ejemplo_almuerzo: string;
  ejemplo_cena: string;
}

const Nutrition: React.FC = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanNutricional | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchNutricion = async () => {
      setIsLoading(true);
      setError("");
      try {
        // Utilizamos la nueva ruta /plan y enviamos los datos del usuario logueado
        // Si el usuario es nuevo y no tiene datos, probamos con el Ectomorfo que recién insertaste
        const params = new URLSearchParams({
          objetivo: user?.objetivo || "Aumento de Masa Muscular",
          somatotipo: user?.somatotipo || "Ectomorfo",
        });

        const response = await api.get(`/plan?${params.toString()}`);
        setPlan(response.data.plan);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error al cargar la nutrición:", err);
        setError(
          "No pudimos encontrar un plan exacto para tu perfil biómetrico en este momento.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchNutricion();
  }, [user?.objetivo, user?.somatotipo]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Nutrición</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Encabezado del Módulo */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            marginTop: "10px",
          }}
        >
          <IonIcon
            icon={restaurantOutline}
            color="primary"
            style={{ fontSize: "3rem" }}
          />
          <h2 style={{ margin: "5px 0" }}>
            Plan de {user?.nombre || "Usuario"}
          </h2>
          <IonBadge color="secondary">
            {user?.somatotipo || "Ectomorfo"}
          </IonBadge>
        </div>

        {isLoading ? (
          <>
            {/* SKELETON: Tarjeta 1 (Macros) */}
            <IonCard
              style={{
                marginBottom: "20px",
                boxShadow: "none",
                border: "1px solid var(--ion-color-step-100)",
              }}
            >
              <IonCardHeader>
                <IonCardSubtitle>
                  <IonSkeletonText
                    animated={true}
                    style={{
                      width: "40%",
                      height: "14px",
                      borderRadius: "4px",
                    }}
                  />
                </IonCardSubtitle>
                <IonCardTitle
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <IonSkeletonText
                    animated={true}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                    }}
                  />
                  <IonSkeletonText
                    animated={true}
                    style={{
                      width: "60%",
                      height: "22px",
                      borderRadius: "4px",
                    }}
                  />
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList
                  lines="none"
                  style={{ background: "transparent", padding: 0 }}
                >
                  {[1, 2, 3].map((item) => (
                    <IonItem key={item} style={{ "--padding-start": "0" }}>
                      <IonSkeletonText
                        animated={true}
                        slot="start"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
                      <IonLabel>
                        <IonSkeletonText
                          animated={true}
                          style={{
                            width: "40%",
                            height: "18px",
                            borderRadius: "4px",
                            marginBottom: "5px",
                          }}
                        />
                        <IonSkeletonText
                          animated={true}
                          style={{
                            width: item === 1 ? "60%" : "80%",
                            height: "14px",
                            borderRadius: "4px",
                          }}
                        />
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* SKELETON: Tarjeta 2 (Menú de Ejemplo) */}
            <IonCard
              style={{
                boxShadow: "none",
                border: "1px solid var(--ion-color-step-100)",
              }}
            >
              <IonCardHeader>
                <IonCardSubtitle>
                  <IonSkeletonText
                    animated={true}
                    style={{
                      width: "50%",
                      height: "14px",
                      borderRadius: "4px",
                    }}
                  />
                </IonCardSubtitle>
                <IonCardTitle
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <IonSkeletonText
                    animated={true}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                    }}
                  />
                  <IonSkeletonText
                    animated={true}
                    style={{
                      width: "50%",
                      height: "22px",
                      borderRadius: "4px",
                    }}
                  />
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList
                  lines="full"
                  style={{ background: "transparent", padding: 0 }}
                >
                  {[1, 2, 3].map((item) => (
                    <IonItem
                      key={item}
                      style={{
                        "--padding-start": "0",
                        alignItems: "flex-start",
                      }}
                    >
                      <IonSkeletonText
                        animated={true}
                        slot="start"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          marginTop: "12px",
                          marginRight: "10px",
                        }}
                      />
                      <IonLabel>
                        {/* Simulación del Título (Desayuno/Almuerzo/Cena) */}
                        <IonSkeletonText
                          animated={true}
                          style={{
                            width: "30%",
                            height: "18px",
                            borderRadius: "4px",
                            marginBottom: "8px",
                          }}
                        />
                        {/* Simulación del Párrafo de la comida (2 líneas) */}
                        <IonSkeletonText
                          animated={true}
                          style={{
                            width: "100%",
                            height: "14px",
                            borderRadius: "4px",
                            marginBottom: "4px",
                          }}
                        />
                        <IonSkeletonText
                          animated={true}
                          style={{
                            width: "75%",
                            height: "14px",
                            borderRadius: "4px",
                          }}
                        />
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          </>
        ) : error ? (
          <div
            className="ion-text-center"
            style={{ color: "var(--ion-color-medium)", marginTop: "30px" }}
          >
            <IonIcon icon={timeOutline} style={{ fontSize: "3rem" }} />
            <p>{error}</p>
          </div>
        ) : plan ? (
          <>
            {/* Tarjeta 1: Resumen de Macronutrientes */}
            <IonCard style={{ marginBottom: "20px" }}>
              <IonCardHeader>
                <IonCardSubtitle>Distribución Diaria</IonCardSubtitle>
                <IonCardTitle
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <IonIcon icon={pieChartOutline} color="primary" />
                  Macros y Calorías
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList
                  lines="none"
                  style={{ background: "transparent", padding: 0 }}
                >
                  <IonItem style={{ "--padding-start": "0" }}>
                    <IonIcon icon={flameOutline} slot="start" color="warning" />
                    <IonLabel>
                      <h3>Energía Base</h3>
                      <p>
                        <IonText color="primary">
                          <strong>{plan.calorias_base} kcal</strong>
                        </IonText>{" "}
                        / día
                      </p>
                    </IonLabel>
                  </IonItem>
                  <IonItem style={{ "--padding-start": "0" }}>
                    <IonIcon
                      icon={fishOutline}
                      slot="start"
                      color="secondary"
                    />
                    <IonLabel>
                      <h3>Proteína</h3>
                      <p>{plan.proteina_porcentaje}% del total calórico</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem style={{ "--padding-start": "0" }}>
                    <IonIcon icon={leafOutline} slot="start" color="success" />
                    <IonLabel>
                      <h3>Carbohidratos & Grasas</h3>
                      <p>
                        {plan.carbos_porcentaje}% Carbos |{" "}
                        {plan.grasas_porcentaje}% Grasas
                      </p>
                    </IonLabel>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Tarjeta 2: Menú de Ejemplo */}
            <IonCard>
              <IonCardHeader>
                <IonCardSubtitle>Estructura Recomendada</IonCardSubtitle>
                <IonCardTitle
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <IonIcon icon={restaurantOutline} color="primary" />
                  Menú de Ejemplo
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList
                  lines="full"
                  style={{ background: "transparent", padding: 0 }}
                >
                  <IonItem
                    style={{ "--padding-start": "0", alignItems: "flex-start" }}
                  >
                    <IonIcon
                      icon={timeOutline}
                      slot="start"
                      color="medium"
                      style={{ marginTop: "12px" }}
                    />
                    <IonLabel className="ion-text-wrap">
                      <IonText color="primary">
                        <h3>
                          <strong>Desayuno</strong>
                        </h3>
                      </IonText>
                      <p style={{ marginTop: "5px" }}>
                        {plan.ejemplo_desayuno}
                      </p>
                    </IonLabel>
                  </IonItem>

                  <IonItem
                    style={{ "--padding-start": "0", alignItems: "flex-start" }}
                  >
                    <IonIcon
                      icon={timeOutline}
                      slot="start"
                      color="medium"
                      style={{ marginTop: "12px" }}
                    />
                    <IonLabel className="ion-text-wrap">
                      <IonText color="primary">
                        <h3>
                          <strong>Almuerzo</strong>
                        </h3>
                      </IonText>
                      <p style={{ marginTop: "5px" }}>
                        {plan.ejemplo_almuerzo}
                      </p>
                    </IonLabel>
                  </IonItem>

                  <IonItem
                    lines="none"
                    style={{ "--padding-start": "0", alignItems: "flex-start" }}
                  >
                    <IonIcon
                      icon={timeOutline}
                      slot="start"
                      color="medium"
                      style={{ marginTop: "12px" }}
                    />
                    <IonLabel className="ion-text-wrap">
                      <IonText color="primary">
                        <h3>
                          <strong>Cena</strong>
                        </h3>
                      </IonText>
                      <p style={{ marginTop: "5px" }}>{plan.ejemplo_cena}</p>
                    </IonLabel>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Tarjeta de Hidratación */}
            <IonCard
              style={{
                marginTop: "20px",
                background: "var(--ion-color-step-50)",
              }}
            >
              <IonItem lines="none" color="transparent">
                <IonIcon icon={waterOutline} slot="start" color="tertiary" />
                <IonLabel className="ion-text-wrap">
                  <p>
                    Recuerda acompañar este plan con al menos{" "}
                    <strong>3 litros de agua</strong> diarios para optimizar el
                    rendimiento y la absorción de nutrientes.
                  </p>
                </IonLabel>
              </IonItem>
            </IonCard>
          </>
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default Nutrition;
