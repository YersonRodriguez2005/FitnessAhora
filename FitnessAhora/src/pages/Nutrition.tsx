import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonIcon,
  IonSkeletonText,
} from "@ionic/react";
import {
  restaurantOutline,
  flameOutline,
  waterOutline,
  timeOutline,
  leafOutline,
  fishOutline,
  sunnyOutline,
  partlySunnyOutline,
  moonOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Nutrition.css";

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
        const params = new URLSearchParams({
          objetivo: user?.objetivo || "Aumento de Masa Muscular",
          somatotipo: user?.somatotipo || "Ectomorfo",
        });
        const response = await api.get(`/plan?${params.toString()}`);
        setPlan(response.data.plan);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError("No encontramos un plan exacto para tu perfil biométrico.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchNutricion();
  }, [user?.objetivo, user?.somatotipo]);

  // Calcular gramos estimados a partir de porcentajes
  const calcGramos = (porcentaje: number, kcal: number, calsPorGramo: number) =>
    Math.round((porcentaje / 100) * kcal / calsPorGramo);

  const macros = plan
    ? [
        {
          label: "Proteína",
          pct: plan.proteina_porcentaje,
          gramos: calcGramos(plan.proteina_porcentaje, plan.calorias_base, 4),
          color: "#3880ff",
          icon: fishOutline,
          unit: "g",
        },
        {
          label: "Carbos",
          pct: plan.carbos_porcentaje,
          gramos: calcGramos(plan.carbos_porcentaje, plan.calorias_base, 4),
          color: "#2dd36f",
          icon: leafOutline,
          unit: "g",
        },
        {
          label: "Grasas",
          pct: plan.grasas_porcentaje,
          gramos: calcGramos(plan.grasas_porcentaje, plan.calorias_base, 9),
          color: "#ffd534",
          icon: flameOutline,
          unit: "g",
        },
      ]
    : [];

  const meals = plan
    ? [
        { label: "Desayuno", content: plan.ejemplo_desayuno, icon: sunnyOutline, color: "#ffd534" },
        { label: "Almuerzo", content: plan.ejemplo_almuerzo, icon: partlySunnyOutline, color: "#ff6b35" },
        { label: "Cena", content: plan.ejemplo_cena, icon: moonOutline, color: "#3880ff" },
      ]
    : [];

  return (
    <IonPage>
      <IonHeader className="nutri-header" translucent>
        <IonToolbar className="nutri-toolbar">
          <div className="nutri-toolbar-inner">
            <h1 className="nutri-toolbar-title">Nutrición</h1>
            <span className="nutri-toolbar-badge">{user?.somatotipo || "—"}</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="nutri-content" fullscreen>
        <div className="nutri-wrapper">

          {/* Hero banner */}
          <div className="nutri-hero">
            <div className="nutri-hero-icon-wrap">
              <IonIcon icon={restaurantOutline} />
            </div>
            <div>
              <p className="nutri-hero-label">Plan personalizado para</p>
              <h2 className="nutri-hero-name">{user?.nombre?.split(" ")[0] || "Atleta"}</h2>
              <p className="nutri-hero-meta">{user?.objetivo}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="nutri-skeleton">
              {/* Calorie skeleton */}
              <div className="skeleton-calorie-card">
                <IonSkeletonText animated style={{ width: "50%", height: "14px", borderRadius: "4px", marginBottom: "8px" }} />
                <IonSkeletonText animated style={{ width: "70%", height: "36px", borderRadius: "6px" }} />
              </div>
              {/* Macro skeletons */}
              <div className="skeleton-macro-row">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton-macro-card">
                    <IonSkeletonText animated style={{ width: "32px", height: "32px", borderRadius: "50%", marginBottom: "8px" }} />
                    <IonSkeletonText animated style={{ width: "60%", height: "18px", borderRadius: "4px", marginBottom: "4px" }} />
                    <IonSkeletonText animated style={{ width: "40%", height: "12px", borderRadius: "4px" }} />
                  </div>
                ))}
              </div>
              {/* Meal skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-meal-card">
                  <IonSkeletonText animated style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <IonSkeletonText animated style={{ width: "30%", height: "12px", borderRadius: "4px", marginBottom: "6px" }} />
                    <IonSkeletonText animated style={{ width: "100%", height: "14px", borderRadius: "4px", marginBottom: "4px" }} />
                    <IonSkeletonText animated style={{ width: "75%", height: "14px", borderRadius: "4px" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="nutri-error">
              <IonIcon icon={timeOutline} />
              <p>{error}</p>
            </div>
          ) : plan ? (
            <>
              {/* Calorie card */}
              <div className="nutri-calorie-card">
                <div className="calorie-left">
                  <p className="calorie-label">Calorías diarias</p>
                  <div className="calorie-value">
                    <IonIcon icon={flameOutline} className="calorie-icon" />
                    <span>{plan.calorias_base.toLocaleString()}</span>
                    <span className="calorie-unit">kcal</span>
                  </div>
                </div>
                <div className="calorie-ring">
                  <svg viewBox="0 0 64 64" className="ring-svg">
                    <circle cx="32" cy="32" r="28" className="ring-track" />
                    <circle
                      cx="32" cy="32" r="28"
                      className="ring-fill"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * 0.25}`}
                    />
                  </svg>
                  <span className="ring-label">75%</span>
                </div>
              </div>

              {/* Macro cards */}
              <p className="nutri-section-label">Distribución de macros</p>
              <div className="nutri-macro-row">
                {macros.map((m) => (
                  <div key={m.label} className="nutri-macro-card">
                    <div className="macro-icon-wrap" style={{ background: `${m.color}22`, color: m.color }}>
                      <IonIcon icon={m.icon} />
                    </div>
                    <span className="macro-gramos" style={{ color: m.color }}>{m.gramos}g</span>
                    <span className="macro-label">{m.label}</span>
                    <div className="macro-bar-bg">
                      <div
                        className="macro-bar-fill"
                        style={{ width: `${m.pct}%`, background: m.color }}
                      />
                    </div>
                    <span className="macro-pct">{m.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Meal plan */}
              <p className="nutri-section-label" style={{ marginTop: "24px" }}>Menú de ejemplo</p>
              <div className="nutri-meals">
                {meals.map((meal, idx) => (
                  <div key={meal.label} className="nutri-meal-card">
                    <div className="meal-icon-wrap" style={{ background: `${meal.color}20`, color: meal.color, borderColor: `${meal.color}40` }}>
                      <IonIcon icon={meal.icon} />
                    </div>
                    <div className="meal-body">
                      <p className="meal-time-label" style={{ color: meal.color }}>{meal.label}</p>
                      <p className="meal-content">{meal.content}</p>
                    </div>
                    {idx < meals.length - 1 && <div className="meal-connector" />}
                  </div>
                ))}
              </div>

              {/* Water reminder */}
              <div className="nutri-water-card">
                <div className="water-icon-wrap">
                  <IonIcon icon={waterOutline} />
                </div>
                <div>
                  <p className="water-title">Hidratación diaria</p>
                  <p className="water-desc">
                    Consume mínimo <strong>3 litros de agua</strong> para optimizar absorción de nutrientes y rendimiento.
                  </p>
                  <div className="water-drops">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className={`water-drop ${i <= 5 ? "drop-filled" : ""}`}>💧</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Nutrition;