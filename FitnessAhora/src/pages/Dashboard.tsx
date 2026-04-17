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
  IonModal,
  IonSpinner,
  useIonViewWillEnter,
  useIonToast,
} from "@ionic/react";
import {
  optionsOutline,
  analyticsOutline,
  barbellOutline,
  fastFoodOutline,
  flashOutline,
  trophyOutline,
  scaleOutline,
  bodyOutline,
  checkmarkCircleOutline,
  closeOutline,
  arrowUpOutline,
  arrowDownOutline,
  removeOutline,
  addOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/Dashboard.css";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HistorialPunto {
  id: number;
  peso_kg: number;
  altura_cm: number;
  imc: number;
  fecha: string;
}

interface BiometriaActual {
  peso_kg: number | null;
  altura_cm: number | null;
  imc: number | null;
  peso_meta_kg: number | null;
}

interface RangoIMC {
  min: number;
  max: number;
  ideal: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clasifica el IMC y devuelve etiqueta + color */
const clasificarIMC = (imc: number | null) => {
  if (imc === null) return { label: "Sin datos", color: "#9ca3af", emoji: "❓" };
  if (imc < 18.5)   return { label: "Bajo peso",    color: "#60a5fa", emoji: "📉" };
  if (imc < 25)     return { label: "Peso normal",  color: "#34d399", emoji: "✅" };
  if (imc < 30)     return { label: "Sobrepeso",    color: "#fbbf24", emoji: "⚠️" };
  return             { label: "Obesidad",     color: "#f87171", emoji: "🔴" };
};

/** Porcentaje de progreso hacia el peso meta (0–100) */
const calcularProgreso = (
  pesoActual: number | null,
  pesoMeta: number | null,
  pesoInicial: number | null,
): number => {
  if (!pesoActual || !pesoMeta || !pesoInicial) return 0;
  if (pesoInicial === pesoMeta) return 100;
  const total = Math.abs(pesoInicial - pesoMeta);
  const avance = Math.abs(pesoInicial - pesoActual);
  return Math.min(100, Math.round((avance / total) * 100));
};

// ─── Mini Gráfica SVG ─────────────────────────────────────────────────────────

const GraficaPeso: React.FC<{
  historial: HistorialPunto[];
  pesoMeta: number | null;
  rangoImc: RangoIMC | null;
  alturaCm: number | null;
}> = ({ historial, pesoMeta, rangoImc, alturaCm }) => {
  if (historial.length < 2) {
    return (
      <div className="grafica-empty">
        <IonIcon icon={analyticsOutline} />
        <p>Registra al menos 2 mediciones para ver tu gráfica</p>
      </div>
    );
  }

  const W = 320;
  const H = 140;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const pesos = historial.map((p) => p.peso_kg);
  const minPeso = Math.min(...pesos, pesoMeta ?? Infinity) - 3;
  const maxPeso = Math.max(...pesos, pesoMeta ?? -Infinity) + 3;

  const toX = (i: number) => PAD.left + (i / (historial.length - 1)) * innerW;
  const toY = (p: number) => PAD.top + ((maxPeso - p) / (maxPeso - minPeso)) * innerH;

  // Línea de progreso
  const pathData = historial
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.peso_kg).toFixed(1)}`)
    .join(" ");

  // Área bajo la curva
  const areaData = `${pathData} L ${toX(historial.length - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} L ${PAD.left.toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

  // Peso meta Y
  const metaY = pesoMeta ? toY(pesoMeta) : null;

  // Rango IMC saludable en Y (si hay altura)
  let rangoMinY: number | null = null;
  let rangoMaxY: number | null = null;
  if (rangoImc && alturaCm) {
    const altM = alturaCm / 100;
    const pesoRangoMin = rangoImc.min * altM * altM;
    const pesoRangoMax = rangoImc.max * altM * altM;
    rangoMinY = toY(pesoRangoMax); // invertido: mayor peso = Y menor
    rangoMaxY = toY(pesoRangoMin);
  }

  const ultimo = historial[historial.length - 1];
  const tendencia = historial.length >= 2
    ? historial[historial.length - 1].peso_kg - historial[historial.length - 2].peso_kg
    : 0;

  return (
    <div className="grafica-container">
      {/* Tendencia badge */}
      <div className="grafica-tendencia">
        <IonIcon
          icon={tendencia < -0.1 ? arrowDownOutline : tendencia > 0.1 ? arrowUpOutline : removeOutline}
          style={{ color: tendencia < -0.1 ? "#34d399" : tendencia > 0.1 ? "#f87171" : "#9ca3af" }}
        />
        <span style={{ color: tendencia < -0.1 ? "#34d399" : tendencia > 0.1 ? "#f87171" : "#9ca3af" }}>
          {tendencia === 0 ? "Sin cambio" : `${tendencia > 0 ? "+" : ""}${tendencia.toFixed(1)} kg`}
        </span>
        <span className="grafica-tendencia-sub">vs medición anterior</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="grafica-svg">
        {/* Zona IMC saludable */}
        {rangoMinY !== null && rangoMaxY !== null && (
          <rect
            x={PAD.left}
            y={rangoMinY}
            width={innerW}
            height={rangoMaxY - rangoMinY}
            fill="#34d399"
            opacity={0.08}
          />
        )}

        {/* Área bajo la curva */}
        <path d={areaData} fill="url(#gradientArea)" opacity={0.25} />

        {/* Gradiente */}
        <defs>
          <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3880ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3880ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Línea de peso meta */}
        {metaY !== null && (
          <>
            <line
              x1={PAD.left} y1={metaY}
              x2={PAD.left + innerW} y2={metaY}
              stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="5,4" opacity={0.9}
            />
            <text x={PAD.left + innerW + 2} y={metaY + 4} fontSize={9} fill="#fbbf24">Meta</text>
          </>
        )}

        {/* Línea de progreso */}
        <path d={pathData} stroke="#3880ff" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Puntos */}
        {historial.map((p, i) => (
          <circle
            key={p.id}
            cx={toX(i)}
            cy={toY(p.peso_kg)}
            r={i === historial.length - 1 ? 5 : 3}
            fill={i === historial.length - 1 ? "#3880ff" : "#93c5fd"}
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}

        {/* Etiquetas eje Y (3 puntos) */}
        {[minPeso + 1, (minPeso + maxPeso) / 2, maxPeso - 1].map((v, i) => (
          <text key={i} x={PAD.left - 4} y={toY(v) + 4} fontSize={9} fill="#9ca3af" textAnchor="end">
            {Math.round(v)}
          </text>
        ))}

        {/* Etiquetas eje X: primera, mitad y última */}
        {[0, Math.floor(historial.length / 2), historial.length - 1].map((i) => (
          historial[i] ? (
            <text
              key={i}
              x={toX(i)}
              y={H - 6}
              fontSize={9}
              fill="#9ca3af"
              textAnchor="middle"
            >
              {historial[i].fecha}
            </text>
          ) : null
        ))}
      </svg>

      {/* Último registro destacado */}
      <div className="grafica-footer">
        <span className="grafica-footer-label">Último registro</span>
        <span className="grafica-footer-val">{ultimo.peso_kg} kg · IMC {ultimo.imc}</span>
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [presentToast] = useIonToast();

  // Stats de entrenamiento
  const [stats, setStats] = useState({ total: 0, racha_semanal: 0 });

  // Biometría
  const [biometria, setBiometria] = useState<BiometriaActual>({
    peso_kg: null, altura_cm: null, imc: null, peso_meta_kg: null,
  });
  const [historial, setHistorial] = useState<HistorialPunto[]>([]);
  const [rangoImc, setRangoImc] = useState<RangoIMC | null>(null);
  const [loadingBio, setLoadingBio] = useState(false);

  // Modal de nueva medición
  const [showModal, setShowModal] = useState(false);
  const [formPeso, setFormPeso] = useState<string>("");
  const [formAltura, setFormAltura] = useState<string>("");
  const [guardando, setGuardando] = useState(false);

  // ── Carga de datos ────────────────────────────────────────────────────────

  useIonViewWillEnter(() => {
    if (!user?.id) return;

    // Estadísticas de entrenamiento
    api.get(`/estadisticas/${user.id}`)
      .then((r) => setStats(r.data))
      .catch((e) => console.error("Error estadísticas", e));

    // Biometría
    cargarBiometria();
  });

  const cargarBiometria = async () => {
    if (!user?.id) return;
    setLoadingBio(true);
    try {
      const res = await api.get(`/biometria/${user.id}`);
      setBiometria(res.data.actual);
      setHistorial(res.data.historial || []);
      setRangoImc(res.data.rango_imc || null);

      // Pre-llenar el form con los valores actuales
      if (res.data.actual.peso_kg)   setFormPeso(String(res.data.actual.peso_kg));
      if (res.data.actual.altura_cm) setFormAltura(String(res.data.actual.altura_cm));
    } catch (e) {
      console.error("Error biometría", e);
    } finally {
      setLoadingBio(false);
    }
  };

  // ── Guardar nueva medición ────────────────────────────────────────────────

  const guardarMedicion = async () => {
    const peso  = parseFloat(formPeso);
    const altura = parseInt(formAltura);

    if (isNaN(peso) || isNaN(altura)) {
      presentToast({ message: "Ingresa peso y altura válidos", duration: 2000, color: "warning" });
      return;
    }
    if (peso < 20 || peso > 300) {
      presentToast({ message: "El peso debe estar entre 20 y 300 kg", duration: 2000, color: "warning" });
      return;
    }
    if (altura < 100 || altura > 250) {
      presentToast({ message: "La altura debe estar entre 100 y 250 cm", duration: 2000, color: "warning" });
      return;
    }

    setGuardando(true);
    try {
      await api.post(`/biometria/${user!.id}`, { peso_kg: peso, altura_cm: altura });
      presentToast({ message: "Medición registrada ✅", duration: 2000, color: "success" });
      setShowModal(false);
      cargarBiometria(); // Refresca datos y gráfica
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      presentToast({
        message: err.response?.data?.mensaje || "Error al guardar",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setGuardando(false);
    }
  };

  // ── Helpers de UI ─────────────────────────────────────────────────────────

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const today   = new Date().getDay();
  const days    = ["L", "M", "X", "J", "V", "S", "D"];
  const imcInfo = clasificarIMC(biometria.imc);

  const pesoInicial = historial.length > 0 ? historial[0].peso_kg : null;
  const progreso    = calcularProgreso(biometria.peso_kg, biometria.peso_meta_kg, pesoInicial);

  const diferenciaMeta = biometria.peso_kg && biometria.peso_meta_kg
    ? parseFloat((biometria.peso_kg - biometria.peso_meta_kg).toFixed(1))
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

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

          {/* ── Hero ─────────────────────────────────────────────────────── */}
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

          {/* ── Stats Row ────────────────────────────────────────────────── */}
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

          {/* ── Weekly Activity ───────────────────────────────────────────── */}
          <div className="week-section">
            <p className="section-label">Actividad semanal</p>
            <div className="week-strip">
              {days.map((d, i) => {
                const todayIdx = today === 0 ? 6 : today - 1;
                const isPast  = i < todayIdx;
                const isToday = i === todayIdx;
                return (
                  <div key={d} className={`day-dot ${isToday ? "day-today" : isPast ? "day-past" : "day-future"}`}>
                    <div className="day-circle" />
                    <span className="day-label">{d}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Biometría ─────────────────────────────────────────────────── */}
          <div className="section-label" style={{ marginBottom: "10px", marginTop: "20px" }}>
            <IonIcon icon={scaleOutline} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Seguimiento corporal
          </div>

          <IonCard className="bio-card">
            <IonCardContent style={{ padding: "16px" }}>

              {loadingBio ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <IonSpinner name="crescent" color="primary" />
                </div>
              ) : (
                <>
                  {/* ── Fila de métricas actuales ── */}
                  <div className="bio-metrics-row">
                    {/* Peso */}
                    <div className="bio-metric">
                      <IonIcon icon={scaleOutline} className="bio-metric-icon" />
                      <span className="bio-metric-val">
                        {biometria.peso_kg !== null ? `${biometria.peso_kg} kg` : "—"}
                      </span>
                      <span className="bio-metric-label">Peso actual</span>
                    </div>

                    {/* Divider */}
                    <div className="bio-metric-divider" />

                    {/* Altura */}
                    <div className="bio-metric">
                      <IonIcon icon={bodyOutline} className="bio-metric-icon" />
                      <span className="bio-metric-val">
                        {biometria.altura_cm !== null ? `${biometria.altura_cm} cm` : "—"}
                      </span>
                      <span className="bio-metric-label">Altura</span>
                    </div>

                    {/* Divider */}
                    <div className="bio-metric-divider" />

                    {/* IMC */}
                    <div className="bio-metric">
                      <span className="bio-imc-emoji">{imcInfo.emoji}</span>
                      <span className="bio-metric-val" style={{ color: imcInfo.color }}>
                        {biometria.imc !== null ? biometria.imc : "—"}
                      </span>
                      <span className="bio-metric-label">IMC</span>
                    </div>
                  </div>

                  {/* ── Chip de clasificación IMC ── */}
                  {biometria.imc !== null && (
                    <div
                      className="bio-imc-chip"
                      style={{ backgroundColor: `${imcInfo.color}18`, borderColor: `${imcInfo.color}40` }}
                    >
                      <span style={{ color: imcInfo.color, fontWeight: 700 }}>{imcInfo.label}</span>
                      {rangoImc && (
                        <span className="bio-imc-chip-sub">
                          · IMC ideal para tu somatotipo: {rangoImc.min}–{rangoImc.max}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Barra de progreso hacia meta ── */}
                  {biometria.peso_meta_kg !== null && biometria.peso_kg !== null && (
                    <div className="bio-progreso">
                      <div className="bio-progreso-header">
                        <span className="bio-progreso-label">Progreso hacia tu meta</span>
                        <span className="bio-progreso-meta">
                          Meta: <strong>{biometria.peso_meta_kg} kg</strong>
                          {diferenciaMeta !== null && diferenciaMeta !== 0 && (
                            <span style={{ color: "#9ca3af", marginLeft: "4px" }}>
                              ({diferenciaMeta > 0 ? `-${diferenciaMeta}` : `+${Math.abs(diferenciaMeta)}`} kg por llegar)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="bio-progress-bar">
                        <div
                          className="bio-progress-fill"
                          style={{
                            width: `${progreso}%`,
                            backgroundColor: progreso >= 100 ? "#34d399" : "#3880ff",
                          }}
                        />
                      </div>
                      <div className="bio-progreso-footer">
                        <span>{progreso}% completado</span>
                        {progreso >= 100 && (
                          <span style={{ color: "#34d399", fontWeight: 700 }}>
                            <IonIcon icon={checkmarkCircleOutline} /> ¡Meta alcanzada!
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Gráfica de historial ── */}
                  <GraficaPeso
                    historial={historial}
                    pesoMeta={biometria.peso_meta_kg}
                    rangoImc={rangoImc}
                    alturaCm={biometria.altura_cm}
                  />

                  {/* ── Botón registrar medición ── */}
                  <IonButton
                    expand="block"
                    className="bio-registro-btn"
                    onClick={() => setShowModal(true)}
                  >
                    <IonIcon icon={addOutline} slot="start" />
                    {biometria.peso_kg ? "Actualizar medición" : "Registrar primera medición"}
                  </IonButton>
                </>
              )}
            </IonCardContent>
          </IonCard>

          {/* ── Biometría (texto) ──────────────────────────────────────────── */}
          <div className="section-label" style={{ marginBottom: "10px", marginTop: "20px" }}>
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
              <IonButton expand="block" fill="clear" className="profile-adjust-btn" routerLink="/onboarding">
                <IonIcon icon={optionsOutline} slot="start" />
                Ajustar perfil
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        {/* ── Modal: registrar medición ──────────────────────────────────── */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          initialBreakpoint={0.65}
          breakpoints={[0, 0.65, 1]}
        >
          <IonHeader>
            <div className="modal-toolbar-inner" style={{ padding: "16px 20px 0" }}>
              <h2 className="modal-title">Nueva medición</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>
          </IonHeader>

          <IonContent>
            <div style={{ padding: "16px 20px 32px" }}>
              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
                Registra tu peso y altura actuales. Se guardará en tu historial para calcular tu progreso.
              </p>

              {/* Campo peso */}
              <div className="bio-input-group">
                <label className="bio-input-label">
                  <IonIcon icon={scaleOutline} /> Peso actual (kg)
                </label>
                <div className="bio-input-row">
                  <button className="bio-stepper-btn" onClick={() => setFormPeso((v) => String(Math.max(20, parseFloat(v || "0") - 0.5)))}>
                    <IonIcon icon={removeOutline} />
                  </button>
                  <input
                    type="number"
                    className="bio-input"
                    value={formPeso}
                    onChange={(e) => setFormPeso(e.target.value)}
                    placeholder="ej. 72.5"
                    step="0.5"
                    min="20"
                    max="300"
                  />
                  <button className="bio-stepper-btn" onClick={() => setFormPeso((v) => String(Math.min(300, parseFloat(v || "0") + 0.5)))}>
                    <IonIcon icon={addOutline} />
                  </button>
                </div>
              </div>

              {/* Campo altura */}
              <div className="bio-input-group" style={{ marginTop: "16px" }}>
                <label className="bio-input-label">
                  <IonIcon icon={bodyOutline} /> Altura (cm)
                </label>
                <div className="bio-input-row">
                  <button className="bio-stepper-btn" onClick={() => setFormAltura((v) => String(Math.max(100, parseInt(v || "0") - 1)))}>
                    <IonIcon icon={removeOutline} />
                  </button>
                  <input
                    type="number"
                    className="bio-input"
                    value={formAltura}
                    onChange={(e) => setFormAltura(e.target.value)}
                    placeholder="ej. 175"
                    step="1"
                    min="100"
                    max="250"
                  />
                  <button className="bio-stepper-btn" onClick={() => setFormAltura((v) => String(Math.min(250, parseInt(v || "0") + 1)))}>
                    <IonIcon icon={addOutline} />
                  </button>
                </div>
              </div>

              {/* Preview IMC en tiempo real */}
              {formPeso && formAltura && !isNaN(parseFloat(formPeso)) && !isNaN(parseInt(formAltura)) && (
                (() => {
                  const imcPreview = parseFloat(
                    (parseFloat(formPeso) / Math.pow(parseInt(formAltura) / 100, 2)).toFixed(1)
                  );
                  const info = clasificarIMC(imcPreview);
                  return (
                    <div
                      className="bio-imc-preview"
                      style={{ borderColor: `${info.color}40`, backgroundColor: `${info.color}10` }}
                    >
                      <span className="bio-imc-preview-label">IMC estimado</span>
                      <span className="bio-imc-preview-val" style={{ color: info.color }}>
                        {imcPreview} — {info.label} {info.emoji}
                      </span>
                    </div>
                  );
                })()
              )}

              <IonButton
                expand="block"
                className="bio-save-btn"
                onClick={guardarMedicion}
                disabled={guardando}
                style={{ marginTop: "24px" }}
              >
                {guardando ? <IonSpinner name="crescent" /> : <><IonIcon icon={checkmarkCircleOutline} slot="start" />Guardar medición</>}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;