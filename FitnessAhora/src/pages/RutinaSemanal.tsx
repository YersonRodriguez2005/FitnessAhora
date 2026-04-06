import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonCheckbox,
  IonSpinner,
  IonSkeletonText,
  useIonToast,
  useIonAlert,
} from "@ionic/react";
import {
  repeatOutline,
  fitnessOutline,
  alertCircleOutline,
  barbellOutline,
  calendarOutline,
  saveOutline,
  closeOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  chevronUpOutline,
  flashOutline,
  barbellOutline as dumbbellIcon,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import confetti from "canvas-confetti";
import "../styles/RutinaSemanal.css";

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

const DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
const DIA_CORTO: Record<string, string> = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié",
  jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

const RutinaSemanal: React.FC = () => {
  const { user, setUser } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diasGuardados = (user as any)?.dias_entrenamiento || ["lunes", "martes", "jueves", "viernes"];

  const [diasUsuario, setDiasUsuario] = useState<string[]>(diasGuardados);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(diasGuardados[0] || "lunes");
  const [equipamiento, setEquipamiento] = useState<string>("Bandas");
  const [rutina, setRutina] = useState<RutinaSemanalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [diasTemporales, setDiasTemporales] = useState<string[]>(diasGuardados);
  const [ejercicioExpandidoId, setEjercicioExpandidoId] = useState<string | null>(null);

  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    const fetchRutina = async () => {
      setIsLoading(true);
      setEjercicioExpandidoId(null);
      try {
        const params = new URLSearchParams({
          objetivo: user?.objetivo || "Aumento de Masa Muscular",
          equipamiento,
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

  const toggleDia = (dia: string) => {
    if (diasTemporales.includes(dia)) {
      setDiasTemporales(diasTemporales.filter((d) => d !== dia));
    } else {
      const nuevosDias = [...diasTemporales, dia].sort(
        (a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b)
      );
      setDiasTemporales(nuevosDias);
    }
  };

  const guardarDiasPersonalizados = async () => {
    if (diasTemporales.length === 0) {
      presentToast({ message: "Selecciona al menos un día", duration: 2000, color: "warning" });
      return;
    }
    try {
      setDiasUsuario(diasTemporales);
      setDiaSeleccionado(diasTemporales[0]);
      const newUser = { ...user!, dias_entrenamiento: diasTemporales };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      setShowModal(false);
      presentToast({ message: "Días actualizados ✅", duration: 2000, color: "success" });
    } catch {
      presentToast({ message: "Error al guardar los días", duration: 2000, color: "danger" });
    }
  };

  const confirmarFinalizacion = () => {
    presentAlert({
      header: "¿Terminar entrenamiento?",
      message: "¿Estás listo para registrar esta sesión como completada?",
      buttons: [
        { text: "Seguir entrenando", role: "cancel" },
        { text: "Sí, finalizar 🔥", handler: () => finalizarEntrenamiento() },
      ],
    });
  };

  const finalizarEntrenamiento = async () => {
    setIsFinishing(true);
    try {
      await api.post("/registrar", { id_usuario: user?.id, dia_nombre: diaSeleccionado });
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#2dd36f", "#ffd534", "#3880ff"] });
      presentToast({ message: "¡Increíble! Sesión completada 🔥", duration: 3000, color: "success", position: "middle" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      presentToast({ message: err.response?.data?.mensaje || "Error al guardar", duration: 2000, color: "warning" });
    } finally {
      setIsFinishing(false);
    }
  };

  const toggleExpansion = (id: string) => {
    setEjercicioExpandidoId(ejercicioExpandidoId === id ? null : id);
  };

  const ejerciciosDelDia = rutina ? rutina[diaSeleccionado] : [];
  const totalSeries = ejerciciosDelDia?.reduce((acc, e) => acc + (e.series || 0), 0) || 0;

  return (
    <IonPage>
      <IonHeader className="rutina-header" translucent>
        <IonToolbar className="rutina-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/train" className="rutina-back" />
          </IonButtons>
          <div className="rutina-toolbar-center">
            <h1 className="rutina-toolbar-title">Plan Semanal</h1>
            <p className="rutina-toolbar-sub">{user?.objetivo}</p>
          </div>
          <IonButtons slot="end">
            <button className="rutina-cal-btn" onClick={() => setShowModal(true)}>
              <IonIcon icon={calendarOutline} />
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="rutina-content" fullscreen>
        <div className="rutina-wrapper">

          {/* Equipment selector */}
          <div className="equip-row">
            <IonIcon icon={dumbbellIcon} className="equip-icon" />
            <IonItem className="equip-select-item" lines="none">
              <IonLabel className="equip-label">Equipamiento</IonLabel>
              <IonSelect
                value={equipamiento}
                onIonChange={(e) => setEquipamiento(e.detail.value)}
                interface="action-sheet"
              >
                <IonSelectOption value="Bandas">Bandas de Resistencia</IonSelectOption>
                <IonSelectOption value="Pesas">Pesas / Gimnasio</IonSelectOption>
                <IonSelectOption value="Corporal">Peso Corporal</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>

          {/* Day selector tabs */}
          <div className="day-tabs">
            {diasUsuario.map((dia) => (
              <button
                key={dia}
                className={`day-tab ${diaSeleccionado === dia ? "day-tab-active" : ""}`}
                onClick={() => setDiaSeleccionado(dia)}
              >
                {DIA_CORTO[dia] || dia.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Day summary bar */}
          {!isLoading && ejerciciosDelDia && ejerciciosDelDia.length > 0 && (
            <div className="day-summary">
              <div className="day-summary-item">
                <IonIcon icon={barbellOutline} />
                <span><strong>{ejerciciosDelDia.length}</strong> ejercicios</span>
              </div>
              <div className="day-summary-divider" />
              <div className="day-summary-item">
                <IonIcon icon={repeatOutline} />
                <span><strong>{totalSeries}</strong> series en total</span>
              </div>
              <div className="day-summary-divider" />
              <div className="day-summary-item">
                <IonIcon icon={flashOutline} />
                <span><strong>~{Math.round(totalSeries * 2.5)} min</strong></span>
              </div>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="rutina-skeleton-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-card-header">
                    <IonSkeletonText animated style={{ width: "40px", height: "40px", borderRadius: "12px" }} />
                    <div style={{ flex: 1 }}>
                      <IonSkeletonText animated style={{ width: "30%", height: "10px", borderRadius: "4px", marginBottom: "6px" }} />
                      <IonSkeletonText animated style={{ width: "60%", height: "14px", borderRadius: "4px" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : ejerciciosDelDia?.length > 0 ? (
            <>
              <div className="rutina-exercise-list">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {ejerciciosDelDia.map((ejercicio: any, index: number) => {
                  const idSeguro = ejercicio.id_ejercicio ? ejercicio.id_ejercicio : `${index + 1}`;
                  const estaExpandido = ejercicioExpandidoId === idSeguro;

                  return (
                    <div
                      key={idSeguro}
                      className={`rutina-exercise-card ${estaExpandido ? "rutina-exercise-card-open" : ""}`}
                    >
                      <button
                        className="rutina-card-trigger"
                        onClick={() => toggleExpansion(idSeguro)}
                      >
                        <div className="rutina-card-index">{index + 1}</div>
                        <div className="rutina-card-info">
                          <p className="rutina-card-grupo">{ejercicio.grupo}</p>
                          <h3 className="rutina-card-nombre">{ejercicio.nombre}</h3>
                          <div className="rutina-card-volumen">
                            <IonIcon icon={repeatOutline} />
                            <span>{ejercicio.series} × {ejercicio.reps}</span>
                          </div>
                        </div>
                        <IonIcon
                          icon={estaExpandido ? chevronUpOutline : chevronDownOutline}
                          className="rutina-chevron"
                        />
                      </button>

                      {estaExpandido && (
                        <div className="rutina-card-expanded">
                          {/* Image */}
                          <div className="rutina-img-container">
                            <img
                              src={`/assets/ejercicios/${ejercicio.imagen_url}`}
                              alt={ejercicio.nombre}
                              className="rutina-exercise-img"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/assets/ejercicios/placeholder.jpg";
                              }}
                            />
                          </div>

                          {/* Details */}
                          <div className="rutina-detail-row">
                            <div className="rutina-detail-item">
                              <IonIcon icon={fitnessOutline} className="detail-icon detail-icon-teal" />
                              <div>
                                <p className="detail-label">Enfoque</p>
                                <p className="detail-value">{ejercicio.grupo}</p>
                              </div>
                            </div>
                          </div>

                          {(ejercicio.tip || ejercicio.consejos) && (
                            <div className="rutina-tip-block">
                              <IonIcon icon={alertCircleOutline} />
                              <p><strong>Coach:</strong> {ejercicio.tip || ejercicio.consejos}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Finish button */}
              <button
                className="rutina-finish-btn"
                onClick={confirmarFinalizacion}
                disabled={isFinishing}
              >
                {isFinishing ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} />
                    Finalizar entrenamiento de hoy
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="rutina-empty">
              <IonIcon icon={calendarOutline} />
              <p>No hay rutina para este día</p>
              <button className="rutina-empty-action" onClick={() => setShowModal(true)}>
                Configurar días
              </button>
            </div>
          )}
        </div>

        {/* Modal de días */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75, 1]}
          className="rutina-modal"
        >
          <IonHeader>
            <IonToolbar className="modal-toolbar">
              <div className="modal-toolbar-inner">
                <h2 className="modal-title">Días de entreno</h2>
                <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeOutline} />
                </button>
              </div>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
            <p className="modal-description">
              Adapta el volumen de tu plan según tu disponibilidad semanal.
            </p>
            <div className="modal-days-list">
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className={`modal-day-row ${diasTemporales.includes(dia) ? "modal-day-active" : ""}`}
                  onClick={() => toggleDia(dia)}
                >
                  <span className="modal-day-name">{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                  <IonCheckbox
                    checked={diasTemporales.includes(dia)}
                    onIonChange={() => toggleDia(dia)}
                  />
                </div>
              ))}
            </div>
            <button className="modal-save-btn" onClick={guardarDiasPersonalizados}>
              <IonIcon icon={saveOutline} />
              Guardar calendario
            </button>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RutinaSemanal;