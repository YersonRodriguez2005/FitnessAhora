import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonIcon,
  IonSpinner,
  useIonToast,
} from "@ionic/react";
import {
  barbellOutline,
  flameOutline,
  arrowForwardOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useHistory } from "react-router-dom";
import "../styles/Onboarding.css";

const OBJETIVOS = [
  {
    value: "Aumento de Masa Muscular",
    label: "Ganar Masa Muscular",
    desc: "Hipertrofia y volumen progresivo",
    icon: barbellOutline,
    color: "#3880ff",
  },
  {
    value: "Bajar de peso",
    label: "Perder Grasa",
    desc: "Déficit calórico y definición",
    icon: flameOutline,
    color: "#ff6b35",
  },
];

const SOMATOTIPOS = [
  {
    value: "Ectomorfo",
    label: "Ectomorfo",
    desc: "Delgado, dificultad para ganar masa",
    emoji: "🏃",
  },
  {
    value: "Mesomorfo",
    label: "Mesomorfo",
    desc: "Atlético, gana y pierde peso fácil",
    emoji: "💪",
  },
  {
    value: "Endomorfo",
    label: "Endomorfo",
    desc: "Complexión ancha, acumula grasa",
    emoji: "🏋️",
  },
];

const Onboarding: React.FC = () => {
  const { user, setUser } = useAuth();
  const history = useHistory();
  const [present] = useIonToast();

  const [step, setStep] = useState(1);
  const [objetivo, setObjetivo] = useState(user?.objetivo || "Aumento de Masa Muscular");
  const [somatotipo, setSomatotipo] = useState(user?.somatotipo || "Ectomorfo");
  const [isLoading, setIsLoading] = useState(false);

  const finalizarOnboarding = async () => {
    setIsLoading(true);
    try {
      await api.put(`/update-profile/${user?.id}`, { objetivo, somatotipo });
      const newUser = { ...user!, objetivo, somatotipo };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      present({ message: "¡Perfil configurado! 🎉", duration: 2000, color: "success" });
      history.replace("/app/Dashboard");
    } catch {
      present({ message: "Error al guardar. Intenta de nuevo.", duration: 2000, color: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="onboarding-content">
        <div className="onboarding-wrapper">

          {/* Top bar */}
          <div className="onboarding-topbar">
            {step === 2 ? (
              <button className="onboarding-back-btn" onClick={() => setStep(1)}>
                <IonIcon icon={arrowBackOutline} />
              </button>
            ) : (
              <div style={{ width: 40 }} />
            )}

            {/* Progress dots */}
            <div className="onboarding-dots">
              <div className={`onboarding-dot ${step >= 1 ? "dot-active" : ""}`} />
              <div className={`onboarding-dot ${step >= 2 ? "dot-active" : ""}`} />
            </div>

            <button className="onboarding-skip-btn" onClick={() => history.replace("/app/Dashboard")}>
              Saltar
            </button>
          </div>

          {/* Step indicator */}
          <div className="onboarding-step-label">
            <span className="step-num">Paso {step}</span>
            <span className="step-of">de 2</span>
          </div>

          {/* STEP 1 — Objetivo */}
          {step === 1 && (
            <div className="onboarding-step">
              <div className="onboarding-hero">
                <div className="onboarding-hero-icon">🎯</div>
                <h1 className="onboarding-title">¿Cuál es tu meta?</h1>
                <p className="onboarding-subtitle">
                  Adaptaremos tu plan de entrenamiento a tu objetivo principal.
                </p>
              </div>

              <div className="option-cards">
                {OBJETIVOS.map((op) => (
                  <button
                    key={op.value}
                    className={`option-card ${objetivo === op.value ? "option-card-selected" : ""}`}
                    style={objetivo === op.value ? { borderColor: op.color, background: `${op.color}18` } : {}}
                    onClick={() => setObjetivo(op.value)}
                  >
                    <div
                      className="option-card-icon"
                      style={{ background: `${op.color}22`, color: op.color, borderColor: `${op.color}44` }}
                    >
                      <IonIcon icon={op.icon} />
                    </div>
                    <div className="option-card-text">
                      <h3 className="option-card-title">{op.label}</h3>
                      <p className="option-card-desc">{op.desc}</p>
                    </div>
                    <div className={`option-check ${objetivo === op.value ? "option-check-visible" : ""}`}
                      style={objetivo === op.value ? { background: op.color } : {}}
                    >
                      <IonIcon icon={checkmarkCircleOutline} />
                    </div>
                  </button>
                ))}
              </div>

              <button className="onboarding-next-btn" onClick={() => setStep(2)}>
                Siguiente
                <IonIcon icon={arrowForwardOutline} />
              </button>
            </div>
          )}

          {/* STEP 2 — Somatotipo */}
          {step === 2 && (
            <div className="onboarding-step">
              <div className="onboarding-hero">
                <div className="onboarding-hero-icon">🧬</div>
                <h1 className="onboarding-title">¿Tu tipo de cuerpo?</h1>
                <p className="onboarding-subtitle">
                  Esto nos ayuda a calibrar el volumen e intensidad de tu rutina.
                </p>
              </div>

              <div className="soma-cards">
                {SOMATOTIPOS.map((tipo) => (
                  <button
                    key={tipo.value}
                    className={`soma-card ${somatotipo === tipo.value ? "soma-card-selected" : ""}`}
                    onClick={() => setSomatotipo(tipo.value)}
                  >
                    <span className="soma-emoji">{tipo.emoji}</span>
                    <div className="soma-text">
                      <h3 className="soma-name">{tipo.label}</h3>
                      <p className="soma-desc">{tipo.desc}</p>
                    </div>
                    {somatotipo === tipo.value && (
                      <IonIcon icon={checkmarkCircleOutline} className="soma-check" />
                    )}
                  </button>
                ))}
              </div>

              <button
                className="onboarding-finish-btn"
                onClick={finalizarOnboarding}
                disabled={isLoading}
              >
                {isLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    Finalizar y entrar
                    <IonIcon icon={checkmarkCircleOutline} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Onboarding;