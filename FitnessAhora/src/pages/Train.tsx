import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonSpinner,
  IonIcon,
  IonButton,
} from "@ionic/react";
import {
  barbellOutline,
  informationCircleOutline,
  warningOutline,
  fitnessOutline,
  flameOutline,
  searchOutline,
  funnelOutline,
  chevronDownOutline,
  chevronUpOutline,
} from "ionicons/icons";
import api from "../services/api";
import "../styles/Train.css";

interface Ejercicio {
  id_ejercicio: string;
  nombre: string;
  grupo_muscular: string;
  equipamiento: string;
  descripcion: string;
  consejos: string;
}

const GRUPOS = ["Todos", "Pecho", "Espalda", "Piernas", "Brazos", "Hombros", "Abdomen"];
const EQUIPOS = [
  { value: "Todos", label: "Cualquiera" },
  { value: "Pesas", label: "Con Pesas" },
  { value: "Bandas", label: "Bandas Elásticas" },
  { value: "Corporal", label: "Peso Corporal" },
];

const muscleEmoji: Record<string, string> = {
  Pecho: "💪", Espalda: "🔙", Piernas: "🦵",
  Brazos: "💪", Hombros: "🏋️", Abdomen: "⚡",
};

const Train: React.FC = () => {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [grupoFiltro, setGrupoFiltro] = useState<string>("Todos");
  const [equipamientoFiltro, setEquipamientoFiltro] = useState<string>("Bandas");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchEjercicios = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (grupoFiltro !== "Todos") params.append("grupo", grupoFiltro);
        if (equipamientoFiltro !== "Todos") params.append("equipamiento", equipamientoFiltro);
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
      <IonHeader className="train-header" translucent>
        <IonToolbar className="train-toolbar">
          <div className="train-toolbar-inner">
            <div>
              <h1 className="train-toolbar-title">Catálogo</h1>
              <p className="train-toolbar-sub">{ejercicios.length} ejercicios</p>
            </div>
            <div className="train-toolbar-actions">
              <button
                className={`train-filter-toggle ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters((v) => !v)}
              >
                <IonIcon icon={funnelOutline} />
              </button>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="train-content" fullscreen>
        <div className="train-wrapper">

          {/* CTA Banner */}
          <div className="train-cta-banner">
            <div className="train-cta-text">
              <p className="train-cta-label">¿Listo para sudar?</p>
              <h2 className="train-cta-title">Comenzar sesión</h2>
            </div>
            <IonButton
              routerLink="/app/train/rutina"
              className="train-cta-btn"
            >
              <IonIcon icon={flameOutline} slot="start" />
              Ir al plan
            </IonButton>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="train-filter-panel">
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label">
                    <IonIcon icon={fitnessOutline} /> Músculo
                  </label>
                  <IonItem className="filter-select-item" lines="none">
                    <IonSelect
                      value={grupoFiltro}
                      onIonChange={(e) => setGrupoFiltro(e.detail.value)}
                      interface="action-sheet"
                      placeholder="Grupo"
                    >
                      {GRUPOS.map((g) => (
                        <IonSelectOption key={g} value={g}>{g}</IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </div>
                <div className="filter-group">
                  <label className="filter-label">
                    <IonIcon icon={barbellOutline} /> Equipo
                  </label>
                  <IonItem className="filter-select-item" lines="none">
                    <IonSelect
                      value={equipamientoFiltro}
                      onIonChange={(e) => setEquipamientoFiltro(e.detail.value)}
                      interface="action-sheet"
                      placeholder="Equipamiento"
                    >
                      {EQUIPOS.map((e) => (
                        <IonSelectOption key={e.value} value={e.value}>{e.label}</IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </div>
              </div>

              {/* Active filters chips */}
              <div className="filter-chips">
                {grupoFiltro !== "Todos" && (
                  <span className="chip chip-primary" onClick={() => setGrupoFiltro("Todos")}>
                    {grupoFiltro} ✕
                  </span>
                )}
                {equipamientoFiltro !== "Todos" && (
                  <span className="chip chip-secondary" onClick={() => setEquipamientoFiltro("Todos")}>
                    {equipamientoFiltro} ✕
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Muscle group pills */}
          <div className="muscle-pills">
            {GRUPOS.map((g) => (
              <button
                key={g}
                className={`muscle-pill ${grupoFiltro === g ? "muscle-pill-active" : ""}`}
                onClick={() => setGrupoFiltro(g)}
              >
                {g !== "Todos" && <span>{muscleEmoji[g]}</span>}
                {g}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="train-loading">
              <IonSpinner name="crescent" color="primary" />
              <p>Cargando ejercicios...</p>
            </div>
          ) : ejercicios.length === 0 ? (
            <div className="train-empty">
              <IonIcon icon={searchOutline} />
              <p>Sin resultados para estos filtros</p>
              <button className="train-empty-reset" onClick={() => { setGrupoFiltro("Todos"); setEquipamientoFiltro("Todos"); }}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="exercise-list">
              {ejercicios.map((ej) => {
                const isOpen = expandedId === ej.id_ejercicio;
                return (
                  <div key={ej.id_ejercicio} className={`exercise-card ${isOpen ? "exercise-card-open" : ""}`}>
                    {/* Header row */}
                    <button
                      className="exercise-card-header"
                      onClick={() => setExpandedId(isOpen ? null : ej.id_ejercicio)}
                    >
                      <div className="exercise-card-left">
                        <div className="exercise-muscle-badge">
                          {muscleEmoji[ej.grupo_muscular] || "🏋️"}
                        </div>
                        <div>
                          <p className="exercise-muscle-label">{ej.grupo_muscular}</p>
                          <h3 className="exercise-name">{ej.nombre}</h3>
                          <span className="exercise-equip-tag">{ej.equipamiento}</span>
                        </div>
                      </div>
                      <IonIcon
                        icon={isOpen ? chevronUpOutline : chevronDownOutline}
                        className="exercise-chevron"
                      />
                    </button>

                    {/* Expanded content */}
                    {isOpen && (
                      <div className="exercise-card-body">
                        <div className="exercise-info-block">
                          <IonIcon icon={informationCircleOutline} className="info-icon info-icon-blue" />
                          <p>{ej.descripcion}</p>
                        </div>
                        {ej.consejos && (
                          <div className="exercise-info-block exercise-tip">
                            <IonIcon icon={warningOutline} className="info-icon info-icon-orange" />
                            <p><strong>Tip técnico: </strong>{ej.consejos}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Train;