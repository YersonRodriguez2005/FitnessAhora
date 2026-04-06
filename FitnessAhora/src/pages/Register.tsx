import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonText,
  IonIcon,
  useIonRouter,
  IonSpinner,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import {
  personAddOutline,
  alertCircleOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../utils/validations";
import "../styles/Register.css";

const Register: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [erroresForm, setErroresForm] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [showTerms, setShowTerms] = useState(false);

  const router = useIonRouter();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errorNombre = validateName(nombre);
    const errorEmail = validateEmail(email);
    const errorPassword = validatePassword(password);

    setErroresForm({
      nombre: errorNombre || "",
      email: errorEmail || "",
      password: errorPassword || "",
    });

    if (errorNombre || errorEmail || errorPassword) return;

    setIsLoading(true);
    try {
      await register(nombre, email, password);
      router.push("/login", "forward", "push");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLevel = getPasswordStrength();
  const strengthLabels = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const strengthColors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <IonPage>
      <IonContent className="register-content">
        <div className="register-bg-accent" />

        <div className="register-wrapper">
          {/* Back button */}
          <button className="register-back-btn" onClick={() => router.goBack()}>
            <IonIcon icon={arrowBackOutline} />
          </button>

          {/* Header */}
          <div className="register-header">
            <div className="register-logo-ring">
              <img
                src="/assets/logo.png"
                alt="FitnessAhora"
                className="register-logo"
              />
            </div>
            <h1 className="register-title">Crear Cuenta</h1>
            <p className="register-subtitle">Únete a FitnessAhora hoy</p>
          </div>

          {/* Steps hint */}
          <div className="register-steps">
            <div className="step active">
              <span>1</span> Cuenta
            </div>
            <div className="step-line" />
            <div className="step">
              <span>2</span> Perfil
            </div>
            <div className="step-line" />
            <div className="step">
              <span>3</span> Listo
            </div>
          </div>

          {/* Form Card */}
          <div className="register-card">
            <form onSubmit={handleRegister}>
              <div className="register-fields">
                {/* NOMBRE */}
                <div className="field-group">
                  <label className="field-label">Nombre completo</label>
                  <IonItem
                    className={`custom-item ${erroresForm.nombre ? "item-error" : nombre ? "item-valid" : ""}`}
                    lines="none"
                  >
                    <IonInput
                      type="text"
                      placeholder="Tu nombre"
                      value={nombre}
                      onIonInput={(e) => setNombre(e.detail.value!)}
                      required
                    />
                    {nombre && !erroresForm.nombre && (
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        slot="end"
                        className="icon-valid"
                      />
                    )}
                  </IonItem>
                  {erroresForm.nombre && (
                    <p className="field-error">{erroresForm.nombre}</p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="field-group">
                  <label className="field-label">Correo electrónico</label>
                  <IonItem
                    className={`custom-item ${erroresForm.email ? "item-error" : email ? "item-valid" : ""}`}
                    lines="none"
                  >
                    <IonInput
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onIonInput={(e) => setEmail(e.detail.value!)}
                      required
                    />
                    {email && !erroresForm.email && (
                      <IonIcon
                        icon={checkmarkCircleOutline}
                        slot="end"
                        className="icon-valid"
                      />
                    )}
                  </IonItem>
                  {erroresForm.email && (
                    <p className="field-error">{erroresForm.email}</p>
                  )}
                </div>

                {/* PASSWORD */}
                <div className="field-group">
                  <label className="field-label">Contraseña</label>
                  <IonItem
                    className={`custom-item ${erroresForm.password ? "item-error" : ""}`}
                    lines="none"
                  >
                    <IonInput
                      type="password"
                      placeholder="Mín. 8 caracteres"
                      value={password}
                      onIonInput={(e) => setPassword(e.detail.value!)}
                      required
                    />
                  </IonItem>

                  {/* Password strength bar */}
                  {password && (
                    <div className="strength-wrapper">
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="strength-bar"
                            style={{
                              backgroundColor:
                                i <= strengthLevel
                                  ? strengthColors[strengthLevel]
                                  : "rgba(255,255,255,0.1)",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="strength-label"
                        style={{ color: strengthColors[strengthLevel] }}
                      >
                        {strengthLabels[strengthLevel]}
                      </span>
                    </div>
                  )}

                  {erroresForm.password && (
                    <p className="field-error">{erroresForm.password}</p>
                  )}
                </div>
              </div>

              {/* Backend error */}
              {error && (
                <div className="register-error">
                  <IonIcon icon={alertCircleOutline} />
                  <IonText>{error}</IonText>
                </div>
              )}

              <IonButton
                expand="block"
                type="submit"
                className="btn-register-action"
                disabled={isLoading}
              >
                {isLoading ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <>
                    <IonIcon icon={personAddOutline} slot="start" />
                    Registrarme
                  </>
                )}
              </IonButton>

              <p className="register-terms">
                Al registrarte aceptas nuestros{" "}
                <span
                  className="register-link"
                  onClick={() => setShowTerms(true)}
                  style={{
                    cursor: "pointer",
                    color: "var(--ion-color-primary)",
                    textDecoration: "underline",
                  }}
                >
                  Términos de uso
                </span>
              </p>
            </form>
          </div>
        </div>
      </IonContent>

      <IonModal isOpen={showTerms} onDidDismiss={() => setShowTerms(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Términos de Uso</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowTerms(false)}>
                Cerrar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div style={{ paddingBottom: '30px', color: 'var(--ion-color-dark)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                ⚖️ Términos y Condiciones de Uso - FitnessAhora
              </h2>
              <p style={{ color: 'var(--ion-color-medium)', marginBottom: '20px' }}>
                <strong>Última actualización: Abril de 2026</strong>
              </p>

              <p style={{ marginBottom: '20px', lineHeight: '1.5' }}>
                Bienvenido a <strong>FitnessAhora</strong>. Al descargar, acceder o utilizar nuestra aplicación móvil y plataforma web (en adelante, la "Aplicación"), usted acepta estar sujeto a los siguientes Términos y Condiciones de Uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar la Aplicación.
              </p>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                1. 📝 Aceptación de los Términos
              </h3>
              <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
                Al registrar una cuenta en FitnessAhora, usted declara que es mayor de edad (18 años) o que cuenta con la autorización expresa de sus padres o tutores legales para utilizar este servicio. La creación de la cuenta constituye una firma electrónica que vincula legalmente al usuario con este documento.
              </p>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                2. 🏥 Descargo de Responsabilidad Médica (Importante)
              </h3>
              <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
                FitnessAhora es una herramienta digital diseñada para proporcionar información, rutinas de ejercicio y planes de distribución de macronutrientes con fines puramente informativos y educativos.
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.5' }}>
                <li style={{ marginBottom: '8px' }}><strong>No somos médicos ni nutricionistas clínicos:</strong> La información proporcionada por la Aplicación no sustituye el consejo, diagnóstico o tratamiento médico profesional.</li>
                <li style={{ marginBottom: '8px' }}><strong>Riesgo asumido:</strong> El uso de los planes de entrenamiento y sugerencias nutricionales se realiza bajo su propio riesgo. Si experimenta dolor, mareos, agotamiento severo o dificultad para respirar, detenga el ejercicio inmediatamente y consulte a un médico.</li>
                <li style={{ marginBottom: '8px' }}>Siempre consulte a un profesional de la salud calificado antes de comenzar cualquier nuevo programa de dieta o ejercicio, especialmente si tiene condiciones médicas preexistentes, lesiones o está embarazada.</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                3. 🔐 Cuentas de Usuario y Seguridad
              </h3>
              <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
                Para utilizar la Aplicación, se le pedirá que cree una cuenta proporcionando su nombre, correo electrónico y una contraseña segura.
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.5' }}>
                <li style={{ marginBottom: '8px' }}>Usted es el único responsable de mantener la confidencialidad de sus credenciales de acceso.</li>
                <li style={{ marginBottom: '8px' }}>Debe notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta.</li>
                <li style={{ marginBottom: '8px' }}>FitnessAhora se reserva el derecho de suspender o cancelar cuentas que violen estos términos, utilicen información falsa o realicen actividades maliciosas en la plataforma.</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                4. 🛡️ Privacidad y Tratamiento de Datos
              </h3>
              <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
                El manejo de su información personal se rige por nuestra Política de Privacidad, estructurada en cumplimiento con la Ley Estatutaria 1581 de 2012 (Ley de Protección de Datos Personales de Colombia).
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.5' }}>
                <li style={{ marginBottom: '8px' }}>Los datos recopilados (nombre, correo electrónico, métricas físicas y objetivos) se utilizan exclusivamente para personalizar las rutinas y calcular requerimientos nutricionales.</li>
                <li style={{ marginBottom: '8px' }}>Las contraseñas son encriptadas mediante algoritmos de seguridad estándar de la industria antes de ser almacenadas.</li>
                <li style={{ marginBottom: '8px' }}>No vendemos ni compartimos su información personal con terceros para fines publicitarios sin su consentimiento expreso.</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                5. 💡 Propiedad Intelectual
              </h3>
              <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
                Todo el contenido presente en FitnessAhora, incluyendo pero no limitado a: textos, gráficos, logotipos, imágenes, ilustraciones de ejercicios, código fuente y algoritmos de generación de rutinas, es propiedad exclusiva de los desarrolladores de FitnessAhora o sus licenciantes, y está protegido por las leyes de derechos de autor y propiedad intelectual. Queda prohibida su reproducción o distribución sin autorización.
              </p>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                6. 🚫 Limitación de Responsabilidad
              </h3>
              <p style={{ marginBottom: '10px', lineHeight: '1.5' }}>
                En la máxima medida permitida por la ley aplicable, FitnessAhora, sus creadores y desarrolladores no serán responsables por ningún daño directo, indirecto, incidental o consecuente que resulte de:
              </p>
              <ul style={{ paddingLeft: '20px', marginBottom: '15px', lineHeight: '1.5' }}>
                <li style={{ marginBottom: '8px' }}>El uso o la imposibilidad de usar la Aplicación.</li>
                <li style={{ marginBottom: '8px' }}>Lesiones físicas, problemas de salud o daños materiales derivados de la ejecución de los ejercicios mostrados en la plataforma.</li>
                <li style={{ marginBottom: '8px' }}>Accesos no autorizados a nuestros servidores seguros y/o a cualquier información personal almacenada en ellos.</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                7. 🔄 Modificaciones a los Términos
              </h3>
              <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
                Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso con al menos 30 días de anticipación antes de que los nuevos términos entren en vigencia. El uso continuo de la Aplicación después de dichos cambios constituye su aceptación de los nuevos términos.
              </p>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px' }}>
                8. ⚖️ Ley Aplicable y Jurisdicción
              </h3>
              <p style={{ marginBottom: '15px', lineHeight: '1.5' }}>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes de la República de Colombia. Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales competentes en Colombia.
              </p>
            </div>
          </IonContent>
        </IonModal>
    </IonPage>
  );
};

export default Register;
