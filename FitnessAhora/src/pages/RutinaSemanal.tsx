import React, { useState, useEffect, useCallback } from "react";
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
  trashOutline,
  addCircleOutline,
  refreshOutline,
  filterOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import confetti from "canvas-confetti";
import "../styles/RutinaSemanal.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Ejercicio {
  id_ejercicio?: string;
  nombre: string;
  grupo?: string;
  grupo_muscular?: string;
  series: number;
  reps: string;
  tip: string;
  imagen_url?: string;
  equipamiento?: string;
  descripcion?: string;
  consejos?: string;
}

type RutinaSemanalData = Record<string, Ejercicio[]>;

// ─── Constantes ───────────────────────────────────────────────────────────────

const DIAS_SEMANA = [
  "lunes", "martes", "miercoles", "jueves",
  "viernes", "sabado", "domingo",
];

const DIA_CORTO: Record<string, string> = {
  lunes: "Lun", martes: "Mar", miercoles: "Mié",
  jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom",
};

// Lista estática de grupos como fallback mientras carga el catálogo
const GRUPOS_MUSCULARES_DEFAULT = [
  "Todos", "Pecho", "Espalda", "Piernas", "Glúteos",
  "Hombros", "Bíceps", "Tríceps", "Abdomen",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizarEjercicioCatalogo = (
  ej: Ejercicio,
  objetivo: string | undefined,
): Ejercicio => ({
  ...ej,
  grupo: ej.grupo_muscular || ej.grupo || "General",
  series: objetivo === "Bajar de peso" ? 3 : 4,
  reps: objetivo === "Bajar de peso" ? "15-20" : "10-12",
  tip: ej.consejos
    ? `${ej.consejos} (Añadido manualmente)`
    : "Añadido manualmente",
  descripcion: ej.descripcion,
  imagen_url: ej.imagen_url,
});

// ─── Componente ───────────────────────────────────────────────────────────────

const RutinaSemanal: React.FC = () => {
  const { user, setUser } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diasGuardados = (user as any)?.dias_entrenamiento || [
    "lunes", "martes", "jueves", "viernes",
  ];

  // ── Estado ──────────────────────────────────────────────────────────────────

  const [diasUsuario, setDiasUsuario] = useState<string[]>(diasGuardados);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>(diasGuardados[0] || "lunes");
  const [equipamiento, setEquipamiento] = useState<string[]>(["Bandas"]);
  const [rutina, setRutina] = useState<RutinaSemanalData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

  // Modales
  const [showDiasModal, setShowDiasModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [diasTemporales, setDiasTemporales] = useState<string[]>(diasGuardados);

  // Catálogo + filtro de grupo muscular dentro del modal
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState<Ejercicio[]>([]);
  const [isLoadingCatalogo, setIsLoadingCatalogo] = useState<boolean>(false);
  const [grupoFiltroModal, setGrupoFiltroModal] = useState<string>("Todos");

  // Expansión de cards
  const [ejercicioExpandidoId, setEjercicioExpandidoId] = useState<string | null>(null);

  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  // Clave de localStorage atada a usuario + equipamiento
  const RUTINA_KEY = `rutina_modificada_${user?.id}_${equipamiento.sort().join("-")}`;

  // ── Fetch de rutina ─────────────────────────────────────────────────────────

  const fetchRutina = useCallback(async () => {
    setIsLoading(true);
    setEjercicioExpandidoId(null);
    try {
      const rutinaGuardada = localStorage.getItem(RUTINA_KEY);
      if (rutinaGuardada) {
        setRutina(JSON.parse(rutinaGuardada));
        return;
      }
      const params = new URLSearchParams({
        objetivo: user?.objetivo || "Aumento de Masa Muscular",
        equipamiento: equipamiento.join(","), 
        dias: diasUsuario.join(","),
      });
      const response = await api.get(`/generar?${params.toString()}`);
      setRutina(response.data.rutina);
      localStorage.setItem(RUTINA_KEY, JSON.stringify(response.data.rutina));
    } catch (error) {
      console.error("Error al cargar la rutina:", error);
      presentToast({ message: "Error al cargar la rutina", duration: 2000, color: "danger" });
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipamiento, user?.objetivo, diasUsuario, user?.id]);

  useEffect(() => { fetchRutina(); }, [fetchRutina]);

  // ── Días personalizados ─────────────────────────────────────────────────────

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

  const guardarDiasPersonalizados = async () => {
    if (diasTemporales.length === 0) {
      presentToast({ message: "Selecciona al menos un día", duration: 2000, color: "warning" });
      return;
    }
    try {
      await api.put(`/usuarios/${user?.id}/dias`, {
        dias_entrenamiento: diasTemporales
      });

      setDiasUsuario(diasTemporales);
      setDiaSeleccionado(diasTemporales[0]);
      const newUser = { ...user!, dias_entrenamiento: diasTemporales };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      setShowDiasModal(false);
      presentToast({ message: "Días actualizados ✅", duration: 2000, color: "success" });
    } catch (error) {
      console.error(error);
      presentToast({ message: "Error al guardar los días en el servidor", duration: 2000, color: "danger" });
    }
  };

  // ── Finalizar entrenamiento ─────────────────────────────────────────────────

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

  // ── Expansión de cards ──────────────────────────────────────────────────────

  const toggleExpansion = (id: string) => {
    setEjercicioExpandidoId(ejercicioExpandidoId === id ? null : id);
  };

  // ── Eliminar ejercicio ──────────────────────────────────────────────────────

  const eliminarEjercicio = (idEjercicio: string | undefined, indexFallback: number) => {
    if (!rutina) return;
    const nuevaRutina = { ...rutina };
    nuevaRutina[diaSeleccionado] = nuevaRutina[diaSeleccionado].filter((ej, index) => {
      if (ej.id_ejercicio) return ej.id_ejercicio !== idEjercicio;
      return index !== indexFallback;
    });
    setRutina(nuevaRutina);
    localStorage.setItem(RUTINA_KEY, JSON.stringify(nuevaRutina));
    presentToast({ message: "Ejercicio eliminado", duration: 1500, color: "medium" });
  };

  // ── Abrir modal de agregar ──────────────────────────────────────────────────

  const abrirModalAgregar = async () => {
    // Resetear filtro cada vez que se abre
    setGrupoFiltroModal("Todos");
    setShowAddModal(true);

    const equipamientosStr = equipamiento.join(",");

    // Solo hace fetch si el catálogo está vacío o cambió el equipamiento
    if (ejerciciosCatalogo.length === 0 || ejerciciosCatalogo[0]?.equipamiento !== equipamientosStr) {
      setIsLoadingCatalogo(true);
      try {
        const response = await api.get(`/ejercicios?equipamiento=${equipamientosStr}`);
        setEjerciciosCatalogo(response.data.ejercicios);
      } catch {
        presentToast({ message: "Error al cargar ejercicios", duration: 2000, color: "danger" });
      } finally {
        setIsLoadingCatalogo(false);
      }
    }
  };

  // ── Agregar ejercicio ───────────────────────────────────────────────────────

  const agregarEjercicio = (ejercicio: Ejercicio) => {
    if (!rutina) return;
    const yaExiste = rutina[diaSeleccionado]?.some((e) => e.id_ejercicio === ejercicio.id_ejercicio);
    if (yaExiste) {
      presentToast({ message: "Este ejercicio ya está en tu rutina de hoy", duration: 2000, color: "warning" });
      return;
    }
    const nuevaRutina = { ...rutina };
    const nuevoEjercicio = normalizarEjercicioCatalogo(ejercicio, user?.objetivo);
    if (!nuevaRutina[diaSeleccionado]) nuevaRutina[diaSeleccionado] = [];
    nuevaRutina[diaSeleccionado].push(nuevoEjercicio);
    setRutina(nuevaRutina);
    localStorage.setItem(RUTINA_KEY, JSON.stringify(nuevaRutina));
    setShowAddModal(false);
    presentToast({ message: `${ejercicio.nombre} agregado ✅`, duration: 2000, color: "success" });
  };

  // ── Reset rutina ────────────────────────────────────────────────────────────

  const confirmarResetRutina = () => {
    presentAlert({
      header: "¿Resetear rutina?",
      message: "Se eliminarán tus cambios y se generará una nueva rutina desde el sistema.",
      buttons: [
        { text: "Cancelar", role: "cancel" },
        { text: "Resetear", handler: () => { localStorage.removeItem(RUTINA_KEY); fetchRutina(); } },
      ],
    });
  };

  // ── Derivados ───────────────────────────────────────────────────────────────

  const ejerciciosDelDia = rutina ? (rutina[diaSeleccionado] ?? []) : [];
  const totalSeries = ejerciciosDelDia.reduce((acc, e) => acc + (Number(e.series) || 0), 0);

  // Filtro local por grupo muscular (se aplica sobre el catálogo ya cargado)
  const ejerciciosFiltradosCatalogo = grupoFiltroModal === "Todos"
    ? ejerciciosCatalogo
    : ejerciciosCatalogo.filter(
        (ej) => (ej.grupo_muscular || ej.grupo || "") === grupoFiltroModal
      );

  // Grupos únicos que realmente existen en el catálogo (para no mostrar tabs vacíos)
  const gruposDisponibles = ["Todos", ...Array.from(
    new Set(ejerciciosCatalogo.map((ej) => ej.grupo_muscular || ej.grupo || "General"))
  ).sort()];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <IonPage>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
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
            <button className="rutina-cal-btn" onClick={confirmarResetRutina} title="Resetear rutina" style={{ marginRight: "4px" }}>
              <IonIcon icon={refreshOutline} />
            </button>
            <button className="rutina-cal-btn" onClick={() => setShowDiasModal(true)} title="Configurar días">
              <IonIcon icon={calendarOutline} />
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* ── Contenido principal ─────────────────────────────────────────────── */}
      <IonContent className="rutina-content" fullscreen>
        <div className="rutina-wrapper">

          {/* Selector de equipamiento MÚLTIPLE */}
          <div className="equip-row">
            <IonIcon icon={dumbbellIcon} className="equip-icon" />
            <IonItem className="equip-select-item" lines="none">
              <IonLabel className="equip-label">Equipamiento</IonLabel>
              <IonSelect
                multiple={true} /* <-- AQUÍ ESTÁ LA MAGIA */
                value={equipamiento}
                onIonChange={(e) => {
                  const nuevosEquipamientos = e.detail.value;
                  // Validación: No dejamos que el usuario quite todos (debe haber al menos 1)
                  if (nuevosEquipamientos.length === 0) {
                    presentToast({ message: "Debes seleccionar al menos un equipamiento", duration: 2000, color: "warning" });
                    return;
                  }
                  setEquipamiento(nuevosEquipamientos);
                  setEjerciciosCatalogo([]);
                }}
                interface="alert"
                okText="Aceptar"
                cancelText="Cancelar"
              >
                <IonSelectOption value="Bandas">Bandas de Resistencia</IonSelectOption>
                <IonSelectOption value="Pesas">Pesas / Gimnasio</IonSelectOption>
                <IonSelectOption value="Corporal">Peso Corporal</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>

          {/* Tabs de días */}
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

          {/* Resumen del día */}
          {!isLoading && ejerciciosDelDia.length > 0 && (
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

          {/* Lista de ejercicios */}
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
          ) : ejerciciosDelDia.length > 0 ? (
            <>
              <div className="rutina-exercise-list">
                {ejerciciosDelDia.map((ejercicio, index) => {
                  const idSeguro = ejercicio.id_ejercicio ?? `fallback_${index}`;
                  const estaExpandido = ejercicioExpandidoId === idSeguro;
                  const grupoMostrado = ejercicio.grupo || ejercicio.grupo_muscular || "General";

                  return (
                    <div key={idSeguro} className={`rutina-exercise-card ${estaExpandido ? "rutina-exercise-card-open" : ""}`}>
                      <button className="rutina-card-trigger" onClick={() => toggleExpansion(idSeguro)}>
                        <div className="rutina-card-index">{index + 1}</div>
                        <div className="rutina-card-info">
                          <p className="rutina-card-grupo">{grupoMostrado}</p>
                          <h3 className="rutina-card-nombre">{ejercicio.nombre}</h3>
                          <div className="rutina-card-volumen">
                            <IonIcon icon={repeatOutline} />
                            <span>{ejercicio.series} × {ejercicio.reps}</span>
                          </div>
                        </div>
                        <IonIcon icon={estaExpandido ? chevronUpOutline : chevronDownOutline} className="rutina-chevron" />
                      </button>

                      {estaExpandido && (
                        <div className="rutina-card-expanded">
                          <div className="rutina-img-container">
                            <img
                              src={ejercicio.imagen_url ? `/assets/ejercicios/${ejercicio.imagen_url}` : "/assets/ejercicios/placeholder.jpg"}
                              alt={ejercicio.nombre}
                              className="rutina-exercise-img"
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/ejercicios/placeholder.jpg"; }}
                            />
                          </div>
                          <div className="rutina-detail-row">
                            <div className="rutina-detail-item">
                              <IonIcon icon={fitnessOutline} className="detail-icon detail-icon-teal" />
                              <div>
                                <p className="detail-label">Enfoque</p>
                                <p className="detail-value">{grupoMostrado}</p>
                              </div>
                            </div>
                          </div>
                          {ejercicio.descripcion && (
                            <div style={{ padding: "0 10px", marginBottom: "15px", fontSize: "14px", color: "#4b5563", lineHeight: "1.5" }}>
                              <p style={{ margin: 0 }}>{ejercicio.descripcion}</p>
                            </div>
                          )}
                          {(ejercicio.tip || ejercicio.consejos) && (
                            <div className="rutina-tip-block">
                              <IonIcon icon={alertCircleOutline} />
                              <p><strong>Coach:</strong> {ejercicio.tip || ejercicio.consejos}</p>
                            </div>
                          )}
                          <button
                            className="rutina-delete-btn"
                            style={{ width: "100%", padding: "12px", marginTop: "10px", backgroundColor: "#fee2e2", color: "#ef4444", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}
                            onClick={() => eliminarEjercicio(ejercicio.id_ejercicio, index)}
                          >
                            <IonIcon icon={trashOutline} /> Quitar este ejercicio
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={abrirModalAgregar}
                style={{ width: "100%", padding: "16px", margin: "15px 0", border: "2px dashed #3880ff", color: "#3880ff", borderRadius: "12px", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "bold" }}
              >
                <IonIcon icon={addCircleOutline} style={{ fontSize: "24px" }} />
                Añadir Ejercicio
              </button>

              <button className="rutina-finish-btn" onClick={confirmarFinalizacion} disabled={isFinishing}>
                {isFinishing ? <IonSpinner name="crescent" /> : <><IonIcon icon={checkmarkCircleOutline} />Finalizar entrenamiento de hoy</>}
              </button>
            </>
          ) : (
            <div className="rutina-empty">
              <IonIcon icon={calendarOutline} />
              <p>No hay rutina para este día</p>
              <button className="rutina-empty-action" onClick={() => setShowDiasModal(true)}>Configurar días</button>
            </div>
          )}
        </div>

        {/* ── Modal: configurar días ───────────────────────────────────────── */}
        <IonModal isOpen={showDiasModal} onDidDismiss={() => setShowDiasModal(false)} initialBreakpoint={0.75} breakpoints={[0, 0.75, 1]} className="rutina-modal">
          <IonHeader>
            <IonToolbar className="modal-toolbar">
              <div className="modal-toolbar-inner">
                <h2 className="modal-title">Días de entreno</h2>
                <button className="modal-close-btn" onClick={() => setShowDiasModal(false)}><IonIcon icon={closeOutline} /></button>
              </div>
            </IonToolbar>
          </IonHeader>
          <IonContent className="modal-content">
            <p className="modal-description">Adapta el volumen de tu plan según tu disponibilidad semanal.</p>
            <div className="modal-days-list">
              {DIAS_SEMANA.map((dia) => (
                <div key={dia} className={`modal-day-row ${diasTemporales.includes(dia) ? "modal-day-active" : ""}`} onClick={() => toggleDia(dia)}>
                  <span className="modal-day-name">{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                  <IonCheckbox checked={diasTemporales.includes(dia)} onIonChange={() => toggleDia(dia)} />
                </div>
              ))}
            </div>
            <button className="modal-save-btn" onClick={guardarDiasPersonalizados}>
              <IonIcon icon={saveOutline} />Guardar calendario
            </button>
          </IonContent>
        </IonModal>

        {/* ── Modal: agregar ejercicio ─────────────────────────────────────── */}
        <IonModal
          isOpen={showAddModal}
          onDidDismiss={() => setShowAddModal(false)}
          initialBreakpoint={0.9}
          breakpoints={[0, 0.9, 1]}
          className="rutina-modal"
        >
          <IonHeader>
            <IonToolbar className="modal-toolbar">
              <div className="modal-toolbar-inner">
                <h2 className="modal-title">Agregar Ejercicio</h2>
                <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                  <IonIcon icon={closeOutline} />
                </button>
              </div>
            </IonToolbar>
          </IonHeader>

          <IonContent className="modal-content">

            {/* ── Filtro de grupo muscular ─────────────────────────────────── */}
            <div style={{ padding: "12px 16px 4px", borderBottom: "1px solid #f3f4f6", marginBottom: "12px" }}>

              {/* Encabezado */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "#6b7280", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <IonIcon icon={filterOutline} style={{ fontSize: "14px" }} />
                Grupo muscular
              </div>

              {/* Pills horizontales con scroll */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "8px",
                  scrollbarWidth: "none",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  msOverflowStyle: "none" as any,
                }}
              >
                {/* Mientras carga usamos la lista estática para evitar layout shift */}
                {(isLoadingCatalogo ? GRUPOS_MUSCULARES_DEFAULT : gruposDisponibles).map((grupo) => {
                  const activo = grupoFiltroModal === grupo;

                  // Badge: cantidad de ejercicios de ese grupo en el catálogo cargado
                  const count = grupo === "Todos"
                    ? ejerciciosCatalogo.length
                    : ejerciciosCatalogo.filter(
                        (ej) => (ej.grupo_muscular || ej.grupo || "") === grupo
                      ).length;

                  return (
                    <button
                      key={grupo}
                      onClick={() => setGrupoFiltroModal(grupo)}
                      style={{
                        flexShrink: 0,
                        padding: "6px 14px",
                        borderRadius: "20px",
                        border: activo ? "none" : "1.5px solid #e5e7eb",
                        backgroundColor: activo ? "#3880ff" : "#ffffff",
                        color: activo ? "#ffffff" : "#374151",
                        fontSize: "13px",
                        fontWeight: activo ? "700" : "500",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        boxShadow: activo ? "0 2px 8px rgba(56,128,255,0.35)" : "none",
                      }}
                    >
                      {grupo}
                      {/* Badge de cantidad, solo cuando el catálogo ya cargó */}
                      {!isLoadingCatalogo && count > 0 && (
                        <span
                          style={{
                            backgroundColor: activo ? "rgba(255,255,255,0.3)" : "#f3f4f6",
                            color: activo ? "#fff" : "#6b7280",
                            borderRadius: "10px",
                            padding: "1px 6px",
                            fontSize: "11px",
                            fontWeight: "600",
                            lineHeight: "1.4",
                          }}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Lista filtrada ───────────────────────────────────────────── */}
            {isLoadingCatalogo ? (
              <div style={{ textAlign: "center", marginTop: "30px" }}>
                <IonSpinner name="crescent" />
              </div>
            ) : ejerciciosFiltradosCatalogo.length === 0 ? (
              <div style={{ textAlign: "center", color: "#6b7280", marginTop: "40px", padding: "0 24px" }}>
                <IonIcon icon={fitnessOutline} style={{ fontSize: "40px", color: "#d1d5db", display: "block", margin: "0 auto 10px" }} />
                <p style={{ margin: 0, fontSize: "15px" }}>
                  {grupoFiltroModal === "Todos"
                    ? "No hay ejercicios disponibles para este equipamiento."
                    : `No hay ejercicios de ${grupoFiltroModal} para este equipamiento.`}
                </p>
                {grupoFiltroModal !== "Todos" && (
                  <button
                    onClick={() => setGrupoFiltroModal("Todos")}
                    style={{ marginTop: "12px", color: "#3880ff", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Ver todos los grupos
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "0 16px 24px" }}>

                {/* Contador de resultados */}
                <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#9ca3af" }}>
                  {ejerciciosFiltradosCatalogo.length} ejercicio{ejerciciosFiltradosCatalogo.length !== 1 ? "s" : ""}
                  {grupoFiltroModal !== "Todos" ? ` de ${grupoFiltroModal}` : ""}
                </p>

                {ejerciciosFiltradosCatalogo.map((ej) => {
                  const yaAgregado = rutina?.[diaSeleccionado]?.some((e) => e.id_ejercicio === ej.id_ejercicio) ?? false;
                  const grupoMostrado = ej.grupo_muscular || ej.grupo || "General";

                  return (
                    <div
                      key={ej.id_ejercicio}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        backgroundColor: yaAgregado ? "#f0fdf4" : "#f9fafb",
                        borderRadius: "12px",
                        border: yaAgregado ? "1.5px solid #86efac" : "1.5px solid #f3f4f6",
                        opacity: yaAgregado ? 0.8 : 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0, marginRight: "12px" }}>
                        <p style={{ margin: 0, fontWeight: "700", color: "#1f2937", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ej.nombre}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                          {/* Badge de grupo */}
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "8px",
                              backgroundColor: "#eff6ff",
                              color: "#3b82f6",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            {grupoMostrado}
                          </span>
                          <span style={{ fontSize: "11px", color: "#9ca3af" }}>{ej.equipamiento}</span>
                        </div>
                      </div>

                      {/* Botón */}
                      <button
                        onClick={() => !yaAgregado && agregarEjercicio(ej)}
                        disabled={yaAgregado}
                        style={{
                          flexShrink: 0,
                          backgroundColor: yaAgregado ? "#bbf7d0" : "#3880ff",
                          color: yaAgregado ? "#16a34a" : "white",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: yaAgregado ? "default" : "pointer",
                          border: "none",
                          transition: "background-color 0.2s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {yaAgregado ? "✓ Añadido" : "+ Añadir"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default RutinaSemanal;