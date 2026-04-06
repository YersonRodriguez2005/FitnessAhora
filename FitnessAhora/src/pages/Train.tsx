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
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonText,
  IonList,
  IonButton,
} from "@ionic/react";
import {
  barbellOutline,
  informationCircleOutline,
  warningOutline,
  fitnessOutline,
  flameOutline,
} from "ionicons/icons";
import api from "../services/api";

// Definimos la interfaz de TypeScript basada en lo que devuelve PostgreSQL
interface Ejercicio {
  id_ejercicio: string;
  nombre: string;
  grupo_muscular: string;
  equipamiento: string;
  descripcion: string;
  consejos: string;
}

const Train: React.FC = () => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estados para los filtros (Por defecto iniciamos con un enfoque en Bandas)
  const [grupoFiltro, setGrupoFiltro] = useState<string>("Todos");
  const [equipamientoFiltro, setEquipamientoFiltro] =
    useState<string>("Bandas");

  // Efecto que se dispara al cargar la página o al cambiar un filtro
  useEffect(() => {
    const fetchEjercicios = async () => {
      setIsLoading(true);
      try {
        // Construimos los query params dinámicamente
        const params = new URLSearchParams();
        if (grupoFiltro !== "Todos") params.append("grupo", grupoFiltro);
        if (equipamientoFiltro !== "Todos")
          params.append("equipamiento", equipamientoFiltro);

        const response = await api.get(`/ejercicios?${params.toString()}`);
        setEjercicios(response.data.ejercicios);
      } catch (error) {
        console.error("Error al cargar los ejercicios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEjercicios();
  }, [grupoFiltro, equipamientoFiltro]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Catálogo de Ejercicios</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {/* Sección de Filtros */}
        <div style={{ marginBottom: "20px" }}>
          <IonItem lines="full" color="transparent">
            <IonButton 
              routerLink="/app/train/rutina"
              expand="block" 
              color="dark" 
              style={{ marginTop: '15px' }}
            >
              <IonIcon icon={flameOutline} slot="start" />
              Comenzar Entrenamiento
            </IonButton>

            <IonLabel>Grupo Muscular</IonLabel>
            <IonSelect
              value={grupoFiltro}
              onIonChange={(e) => setGrupoFiltro(e.detail.value)}
              interface="action-sheet"
            >
              <IonSelectOption value="Todos">Todos</IonSelectOption>
              <IonSelectOption value="Pecho">Pecho</IonSelectOption>
              <IonSelectOption value="Espalda">Espalda</IonSelectOption>
              <IonSelectOption value="Piernas">Piernas</IonSelectOption>
              <IonSelectOption value="Brazos">Brazos</IonSelectOption>
              <IonSelectOption value="Hombros">Hombros</IonSelectOption>
              <IonSelectOption value="Abdomen">Abdomen</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem lines="full" color="transparent">
            <IonLabel>Equipamiento</IonLabel>
            <IonSelect
              value={equipamientoFiltro}
              onIonChange={(e) => setEquipamientoFiltro(e.detail.value)}
              interface="action-sheet"
            >
              <IonSelectOption value="Todos">Cualquiera</IonSelectOption>
              <IonSelectOption value="Pesas">Con Pesas</IonSelectOption>
              <IonSelectOption value="Bandas">Bandas Elásticas</IonSelectOption>
              <IonSelectOption value="Corporal">
                Sin Pesas (Corporal)
              </IonSelectOption>
            </IonSelect>
          </IonItem>
        </div>

        {/* Estado de Carga */}
        {isLoading ? (
          <div className="ion-text-center" style={{ marginTop: "50px" }}>
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando rutinas...</p>
          </div>
        ) : /* Lista de Ejercicios Renderizada */
        ejercicios.length === 0 ? (
          <div
            className="ion-text-center"
            style={{ marginTop: "50px", color: "var(--ion-color-medium)" }}
          >
            <IonIcon icon={barbellOutline} style={{ fontSize: "3rem" }} />
            <p>No se encontraron ejercicios con estos filtros.</p>
          </div>
        ) : (
          ejercicios.map((ejercicio) => (
            <IonCard
              key={ejercicio.id_ejercicio}
              style={{ marginBottom: "15px" }}
            >
              <IonCardHeader>
                <IonCardSubtitle style={{ color: "var(--ion-color-primary)" }}>
                  {ejercicio.grupo_muscular}
                </IonCardSubtitle>
                <IonCardTitle>{ejercicio.nombre}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <IonList
                  lines="none"
                  style={{ padding: 0, background: "transparent" }}
                >
                  <IonItem
                    style={{ "--padding-start": "0", "--min-height": "30px" }}
                  >
                    <IonIcon
                      icon={fitnessOutline}
                      slot="start"
                      color="secondary"
                      style={{ marginEnd: "10px" }}
                    />
                    <IonLabel className="ion-text-wrap">
                      <IonText color="medium">
                        <strong>Modalidad:</strong> {ejercicio.equipamiento}
                      </IonText>
                    </IonLabel>
                  </IonItem>

                  <IonItem
                    style={{ "--padding-start": "0", "--min-height": "30px" }}
                  >
                    <IonIcon
                      icon={informationCircleOutline}
                      slot="start"
                      color="medium"
                      style={{ marginEnd: "10px" }}
                    />
                    <IonLabel className="ion-text-wrap">
                      <p style={{ marginTop: "5px" }}>
                        {ejercicio.descripcion}
                      </p>
                    </IonLabel>
                  </IonItem>

                  {ejercicio.consejos && (
                    <IonItem
                      style={{
                        "--padding-start": "0",
                        "--min-height": "30px",
                        alignItems: "flex-start",
                      }}
                    >
                      <IonIcon
                        icon={warningOutline}
                        slot="start"
                        color="warning"
                        style={{ marginEnd: "10px", marginTop: "12px" }}
                      />
                      <IonLabel className="ion-text-wrap">
                        <p style={{ marginTop: "10px", fontStyle: "italic" }}>
                          <strong>Tip técnico:</strong> {ejercicio.consejos}
                        </p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default Train;
