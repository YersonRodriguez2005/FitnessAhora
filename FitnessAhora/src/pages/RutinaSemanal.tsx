import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonIcon,
  IonButtons,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonButton,
  IonModal,
  IonCheckbox,
  useIonToast,
  useIonAlert,
  IonSkeletonText,
} from "@ionic/react";
import {
  repeatOutline,
  fitnessOutline,
  alertCircleOutline,
  flameOutline,
  barbellOutline,
  calendarOutline,
  saveOutline,
  closeOutline,
  checkmarkCircleOutline,
  chevronDownOutline, // <-- Nuevo
  chevronUpOutline, // <-- Nuevo
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import confetti from "canvas-confetti";

interface Ejercicio {
  id_ejercicio?: string;
  nombre: string;
  grupo: string;
  series: number;
  reps: string;
  tip: string;
  imagen_url?: string;
}

type RutinaSemanalData = Record<string, Ejercicio[]>;

// Días de la semana disponibles para el sistema
const DIAS_SEMANA = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const RutinaSemanal: React.FC = () => {
  const { user, setUser } = useAuth();

  // Asumimos que el backend nos devuelve los días del usuario, o usamos un esquema de 4 días por defecto
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diasGuardados = (user as any)?.dias_entrenamiento || [
    "lunes",
    "martes",
    "jueves",
    "viernes",
  ];

  const [diasUsuario, setDiasUsuario] = useState<string[]>(diasGuardados);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(
    diasGuardados[0] || "lunes",
  );
  const [equipamiento, setEquipamiento] = useState<string>("Bandas");
  const [rutina, setRutina] = useState<RutinaSemanalData | null>(null);

  // Estados de carga y modales
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [diasTemporales, setDiasTemporales] = useState<string[]>(diasGuardados);
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  // NUEVO ESTADO: Guarda el ID (o index) del ejercicio que está expandido
  const [ejercicioExpandidoId, setEjercicioExpandidoId] = useState<
    string | null
  >(null);

  // Efecto principal para buscar la rutina
  useEffect(() => {
    const fetchRutina = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          objetivo: user?.objetivo || "Aumento de Masa Muscular",
          equipamiento: equipamiento,
          dias: diasUsuario.join(","),
        });

        const response = await api.get(`/generar?${params.toString()}`);
        setRutina(response.data.rutina);
      } catch (error) {
        console.error("Error al cargar la rutina:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRutina();
  }, [equipamiento, user?.objetivo, diasUsuario]);

  // Manejador para los checkboxes del Modal
  const toggleDia = (dia: string) => {
    if (diasTemporales.includes(dia)) {
      setDiasTemporales(diasTemporales.filter((d) => d !== dia));
    } else {
      const nuevosDias = [...diasTemporales, dia].sort(
        (a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b),
      );
      setDiasTemporales(nuevosDias);
    }
  };

  // Guardar los días personalizados en la Base de Datos
  const guardarDiasPersonalizados = async () => {
    if (diasTemporales.length === 0) {
      presentToast({
        message: "Selecciona al menos un día",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    try {
      setDiasUsuario(diasTemporales);
      setDiaSeleccionado(diasTemporales[0]);

      const newUser = { ...user!, dias_entrenamiento: diasTemporales };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));

      setShowModal(false);
      presentToast({
        message: "Días de entrenamiento actualizados",
        duration: 2000,
        color: "success",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      presentToast({
        message: "Error al guardar los días",
        duration: 2000,
        color: "danger",
      });
    }
  };

  // Función que intercepta el click de finalizar
  const confirmarFinalizacion = () => {
    presentAlert({
      header: "¿Terminar entrenamiento?",
      message: "¿Estás seguro de registrar esta rutina como completada?",
      buttons: [
        {
          text: "Seguir entrenando",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Sí, finalizar",
          handler: () => {
            finalizarEntrenamiento();
          },
        },
      ],
    });
  };

  // Función de Gamificación y Registro
  const finalizarEntrenamiento = async () => {
    setIsFinishing(true);
    try {
      await api.post("/registrar", {
        id_usuario: user?.id,
        dia_nombre: diaSeleccionado,
      });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#2dd36f", "#ffd534", "#3880ff"],
      });

      presentToast({
        message: "¡Increíble! Entrenamiento de hoy completado. 🔥",
        duration: 3000,
        color: "success",
        position: "middle",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      presentToast({
        message: err.response?.data?.mensaje || "Error al guardar el progreso",
        duration: 2000,
        color: "warning",
      });
    } finally {
      setIsFinishing(false);
    }
  };

  // Función para abrir/cerrar tarjeta de ejercicio
  const toggleExpansion = (id: string) => {
    if (ejercicioExpandidoId === id) {
      setEjercicioExpandidoId(null);
    } else {
      setEjercicioExpandidoId(id);
    }
  };

  const ejerciciosDelDia = rutina ? rutina[diaSeleccionado] : [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/train" />
          </IonButtons>
          <IonTitle>Mi Plan Semanal</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowModal(true)}>
              <IonIcon icon={calendarOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <IonIcon
            icon={flameOutline}
            color="primary"
            style={{ fontSize: "3rem" }}
          />
          <h2 style={{ margin: "5px 0" }}>Plan: {user?.objetivo}</h2>
        </div>

        <IonItem
          lines="none"
          style={{
            marginBottom: "15px",
            borderRadius: "10px",
            background: "var(--ion-color-step-50)",
          }}
        >
          <IonLabel color="medium">Equipamiento:</IonLabel>
          <IonSelect
            value={equipamiento}
            onIonChange={(e) => setEquipamiento(e.detail.value)}
            interface="action-sheet"
          >
            <IonSelectOption value="Bandas">
              Bandas de Resistencia
            </IonSelectOption>
            <IonSelectOption value="Pesas">Pesas / Gimnasio</IonSelectOption>
            <IonSelectOption value="Corporal">Peso Corporal</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonSegment
          value={diaSeleccionado}
          onIonChange={(e) => setDiaSeleccionado(e.detail.value as string)}
          style={{ marginBottom: "20px", overflowX: "auto" }}
          scrollable={true}
        >
          {diasUsuario.map((dia) => (
            <IonSegmentButton key={dia} value={dia}>
              <IonLabel style={{ textTransform: "capitalize" }}>
                {dia.slice(0, 3)}
              </IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>

        {isLoading ? (
          <>
            {[1, 2, 3].map((esqueleto) => (
              <IonCard
                key={esqueleto}
                style={{
                  marginBottom: "15px",
                  boxShadow: "none",
                  border: "1px solid var(--ion-color-step-100)",
                }}
              >
                <IonCardHeader>
                  <IonCardTitle
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
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
                        height: "20px",
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
                      <IonItem
                        key={item}
                        style={{
                          "--padding-start": "0",
                          "--min-height": "30px",
                        }}
                      >
                        <IonSkeletonText
                          animated={true}
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            marginRight: "10px",
                          }}
                          slot="start"
                        />
                        <IonLabel>
                          <IonSkeletonText
                            animated={true}
                            style={{
                              width: item === 3 ? "90%" : "70%",
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
            ))}
          </>
        ) : ejerciciosDelDia?.length > 0 ? (
          <>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {ejerciciosDelDia.map((ejercicio: any, index: number) => {
              // 🔥 EL TRUCO: Si el backend no envía el ID, usamos el índice de la lista (+1) para que nunca sea "undefined"
              const idSeguro = ejercicio.id_ejercicio
                ? ejercicio.id_ejercicio
                : index + 1;

              const estaExpandido =
                ejercicioExpandidoId === idSeguro.toString();

              return (
                <IonCard
                  key={idSeguro}
                  style={{ marginBottom: "15px", cursor: "pointer" }}
                  onClick={() => toggleExpansion(idSeguro.toString())}
                >
                  <IonCardHeader>
                    {/* ... (Todo tu código del IonCardTitle y la parte siempre visible se mantiene igual) ... */}
                    <IonCardTitle
                      style={{
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <IonIcon icon={barbellOutline} color="primary" />
                        {ejercicio.nombre}
                      </div>
                      <IonIcon
                        icon={
                          estaExpandido ? chevronUpOutline : chevronDownOutline
                        }
                        color="medium"
                        style={{ transition: "0.3s transform" }}
                      />
                    </IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent>
                    {/* ZONA SIEMPRE VISIBLE */}
                    <IonList
                      lines="none"
                      style={{ background: "transparent", padding: 0 }}
                    >
                      <IonItem
                        style={{
                          "--padding-start": "0",
                          "--min-height": "30px",
                        }}
                      >
                        <IonIcon
                          icon={repeatOutline}
                          slot="start"
                          color="medium"
                        />
                        <IonLabel>
                          <p>
                            <strong>Volumen:</strong> {ejercicio.series} series
                            de {ejercicio.reps}
                          </p>
                        </IonLabel>
                      </IonItem>
                    </IonList>

                    {/* ZONA EXPANDIBLE */}
                    {estaExpandido && (
                      <div
                        style={{
                          marginTop: "15px",
                          borderTop: "1px solid var(--ion-color-step-100)",
                          paddingTop: "15px",
                        }}
                      >
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "15px", backgroundColor: "var(--ion-color-step-50)", borderRadius: "12px", padding: "15px" }}>
                          
                          {/* LEEMOS EL NOMBRE DEL ARCHIVO DESDE LA BASE DE DATOS */}
                          <img
                            src={`/assets/ejercicios/${ejercicio.imagen_url}`}
                            alt={ejercicio.nombre}
                            style={{
                              maxHeight: "220px",
                              width: "auto",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/assets/ejercicios/placeholder.jpg";
                            }}
                          />
                          
                          <p style={{ marginTop: "15px", fontSize: "0.9rem", color: "var(--ion-color-medium)", textAlign: "center", fontStyle: "italic" }}>
                            Ilustración: {ejercicio.nombre}
                          </p>
                        </div>

                        {/* DETALLES TÉCNICOS */}
                        <IonList
                          lines="none"
                          style={{ background: "transparent", padding: 0 }}
                        >
                          <IonItem
                            style={{
                              "--padding-start": "0",
                              "--min-height": "30px",
                            }}
                          >
                            <IonIcon
                              icon={fitnessOutline}
                              slot="start"
                              color="secondary"
                            />
                            <IonLabel className="ion-text-wrap">
                              <p>
                                <strong>Enfoque:</strong> {ejercicio.grupo}
                              </p>
                            </IonLabel>
                          </IonItem>
                          <IonItem
                            style={{
                              "--padding-start": "0",
                              "--min-height": "30px",
                              alignItems: "flex-start",
                            }}
                          >
                            <IonIcon
                              icon={alertCircleOutline}
                              slot="start"
                              color="warning"
                              style={{ marginTop: "12px" }}
                            />
                            <IonLabel className="ion-text-wrap">
                              <p style={{ marginTop: "10px" }}>
                                <strong>Coach:</strong>{" "}
                                {ejercicio.tip || ejercicio.consejos}
                              </p>
                            </IonLabel>
                          </IonItem>
                        </IonList>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              );
            })}

            <IonButton
              expand="block"
              color="success"
              style={{ marginTop: "30px", marginBottom: "50px" }}
              onClick={confirmarFinalizacion}
              disabled={isFinishing}
            >
              {isFinishing ? (
                <IonSpinner name="crescent" style={{ marginRight: "10px" }} />
              ) : (
                <IonIcon icon={checkmarkCircleOutline} slot="start" />
              )}
              {isFinishing ? "Guardando..." : "Finalizar Entrenamiento de Hoy"}
            </IonButton>
          </>
        ) : (
          <div
            className="ion-text-center"
            style={{ color: "var(--ion-color-medium)", marginTop: "30px" }}
          >
            <IonIcon
              icon={calendarOutline}
              style={{ fontSize: "3rem", marginBottom: "10px" }}
            />
            <p>No hay rutina programada para este día.</p>
            <IonButton fill="clear" onClick={() => setShowModal(true)}>
              Configurar mis días
            </IonButton>
          </div>
        )}

        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75, 1]}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Días de Entrenamiento</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <p
              style={{
                color: "var(--ion-color-medium)",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              Selecciona los días que tienes disponibles para entrenar.
              Adaptaremos el volumen de tu rutina a tu disponibilidad.
            </p>
            <IonList lines="full">
              {DIAS_SEMANA.map((dia) => (
                <IonItem key={dia}>
                  <IonLabel style={{ textTransform: "capitalize" }}>
                    {dia}
                  </IonLabel>
                  <IonCheckbox
                    slot="end"
                    checked={diasTemporales.includes(dia)}
                    onIonChange={() => toggleDia(dia)}
                  />
                </IonItem>
              ))}
            </IonList>
            <IonButton
              expand="block"
              style={{ marginTop: "25px" }}
              onClick={guardarDiasPersonalizados}
            >
              <IonIcon icon={saveOutline} slot="start" />
              Guardar Calendario
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RutinaSemanal;
