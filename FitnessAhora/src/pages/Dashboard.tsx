import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  useIonViewWillEnter,
} from "@ionic/react";
import {
  optionsOutline,
  analyticsOutline,
  barbellOutline,
  fastFoodOutline,
  flashOutline,
  trophyOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/dashboard.css";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, racha_semanal: 0 });

  useIonViewWillEnter(() => {
    const loadStats = async () => {
      if (user?.id) {
        try {
          const res = await api.get(`/estadisticas/${user.id}`);
          setStats(res.data);
        } catch (error) {
          console.error("Error al cargar estadísticas", error);
        }
      }
    };
    loadStats();
  });

  // Day-based greeting
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // Days of week tracker (mock — replace with real data)
  const today = new Date().getDay();
  const days = ["L", "M", "X", "J", "V", "S", "D"];

  return (
    <IonPage>
      <IonHeader className="dashboard-header" translucent>
        <IonToolbar className="dashboard-toolbar">
          <div className="toolbar-inner">
            <div className="toolbar-brand">
              <img src="/assets/logo.png" alt="FitnessAhora" className="toolbar-logo" />
              <span className="toolbar-name">FitnessAhora</span>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content" fullscreen>
        <div className="dashboard-wrapper">

          {/* ── Hero Greeting ── */}
          <div className="hero-section">
            <div className="hero-text">
              <p className="hero-greeting">{getGreeting()},</p>
              <h1 className="hero-name">{user?.nombre?.split(" ")[0] || "Atleta"} 👋</h1>
              <p className="hero-cta">Listo para tu próxima sesión</p>
            </div>
            <div className="hero-badge">
              <IonIcon icon={flashOutline} />
            </div>
          </div>

          {/* ── Stats Row ── */}
          <div className="stats-row">
            <div className="stat-card stat-total">
              <IonIcon icon={trophyOutline} className="stat-icon" />
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Sesiones</span>
            </div>
            <div className="stat-card stat-week">
              <IonIcon icon={flashOutline} className="stat-icon" />
              <span className="stat-value">{stats.racha_semanal}</span>
              <span className="stat-label">Esta semana</span>
            </div>
          </div>

          {/* ── Weekly Activity Strip ── */}
          <div className="week-section">
            <p className="section-label">Actividad semanal</p>
            <div className="week-strip">
              {days.map((d, i) => {
                // today index: JS Sunday=0 → remap to Mon=0
                const todayIdx = today === 0 ? 6 : today - 1;
                const isPast = i < todayIdx;
                const isToday = i === todayIdx;
                return (
                  <div
                    key={d}
                    className={`day-dot ${isToday ? "day-today" : isPast ? "day-past" : "day-future"}`}
                  >
                    <div className="day-circle" />
                    <span className="day-label">{d}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Profile Card ── */}
          <div className="section-label" style={{ marginBottom: "10px" }}>
            <IonIcon icon={analyticsOutline} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Tu Biometría
          </div>

          <IonCard className="profile-card">
            <IonCardContent className="profile-card-content">
              <div className="profile-row">
                <div className="profile-item">
                  <div className="profile-icon-wrap profile-icon-blue">
                    <IonIcon icon={barbellOutline} />
                  </div>
                  <div className="profile-info">
                    <span className="profile-info-label">Objetivo</span>
                    <span className="profile-info-value">{user?.objetivo || "Sin definir"}</span>
                  </div>
                </div>
                <div className="profile-divider" />
                <div className="profile-item">
                  <div className="profile-icon-wrap profile-icon-orange">
                    <IonIcon icon={fastFoodOutline} />
                  </div>
                  <div className="profile-info">
                    <span className="profile-info-label">Somatotipo</span>
                    <span className="profile-info-value">{user?.somatotipo || "Sin definir"}</span>
                  </div>
                </div>
              </div>

              <IonButton
                expand="block"
                fill="clear"
                className="profile-adjust-btn"
                routerLink="/onboarding"
              >
                <IonIcon icon={optionsOutline} slot="start" />
                Ajustar perfil
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;