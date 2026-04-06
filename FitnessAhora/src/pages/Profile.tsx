import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonIcon,
  IonInput,
  IonItem,
  IonSpinner,
  useIonToast,
  useIonAlert,
} from "@ionic/react";
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  logOutOutline,
  saveOutline,
  cameraOutline,
  chevronForwardOutline,
  barbellOutline,
  bodyOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";
import api from "../services/api";
import "../styles/Profile.css";

const Profile: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [isSaving, setIsSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);

  const handleLogout = () => {
    presentAlert({
      header: "Cerrar Sesión",
      message: "¿Seguro que quieres salir de tu cuenta?",
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Sí, salir",
          role: "destructive",
          handler: () => {
            logout();
            history.replace("/login");
          },
        },
      ],
    });
  };

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      presentToast({ message: "El nombre no puede estar vacío", duration: 2000, color: "warning" });
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`/update-account/${user?.id}`, { nombre });
      const newUser = { ...user!, nombre };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));
      setEditingName(false);
      presentToast({ message: "Nombre actualizado ✅", duration: 2000, color: "success" });
    } catch {
      presentToast({ message: "Error al actualizar", duration: 2000, color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const cambiarPassword = () => {
    presentAlert({
      header: "Cambiar Contraseña",
      inputs: [
        { name: "oldPassword", type: "password", placeholder: "Contraseña actual" },
        { name: "newPassword", type: "password", placeholder: "Nueva contraseña" },
      ],
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Actualizar",
          handler: async (data) => {
            if (!data.oldPassword || !data.newPassword) {
              presentToast({ message: "Ambos campos son obligatorios", duration: 2000, color: "warning" });
              return false;
            }
            try {
              await api.put(`/change-password/${user?.id}`, data);
              presentToast({ message: "Contraseña actualizada ✅", duration: 2000, color: "success" });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              presentToast({ message: error.response?.data?.mensaje || "Contraseña actual incorrecta", duration: 2500, color: "danger" });
              return false;
            }
          },
        },
      ],
    });
  };

  // Initials for avatar
  const initials = (user?.nombre || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <IonPage>
      <IonContent className="profile-content">
        <div className="profile-wrapper">

          {/* ── Avatar hero ── */}
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                <span>{initials}</span>
              </div>
              <button
                className="profile-avatar-cam"
                onClick={() => presentToast({ message: "Gestión de avatar próximamente", duration: 2000 })}
              >
                <IonIcon icon={cameraOutline} />
              </button>
            </div>
            <h1 className="profile-hero-name">{user?.nombre || "Atleta"}</h1>
            <p className="profile-hero-email">{user?.email}</p>

            {/* Stat pills */}
            <div className="profile-stat-pills">
              <div className="profile-stat-pill">
                <IonIcon icon={barbellOutline} />
                <span>{user?.objetivo || "Sin objetivo"}</span>
              </div>
              <div className="profile-stat-pill">
                <IonIcon icon={bodyOutline} />
                <span>{user?.somatotipo || "Sin definir"}</span>
              </div>
            </div>
          </div>

          {/* ── Datos personales ── */}
          <p className="profile-section-label">Datos personales</p>
          <div className="profile-card">

            {/* Nombre field */}
            <div className="profile-field">
              <div className="profile-field-icon-wrap">
                <IonIcon icon={personOutline} />
              </div>
              <div className="profile-field-body">
                <p className="profile-field-label">Nombre completo</p>
                {editingName ? (
                  <IonItem className="profile-input-item" lines="none">
                    <IonInput
                      value={nombre}
                      onIonInput={(e) => setNombre(e.detail.value!)}
                      className="profile-input"
                    />
                  </IonItem>
                ) : (
                  <p className="profile-field-value">{user?.nombre}</p>
                )}
              </div>
              {editingName ? (
                <button
                  className="profile-save-inline-btn"
                  onClick={guardarCambios}
                  disabled={isSaving}
                >
                  {isSaving ? <IonSpinner name="crescent" style={{ width: 16, height: 16 }} /> : <IonIcon icon={saveOutline} />}
                </button>
              ) : (
                <button className="profile-edit-btn" onClick={() => setEditingName(true)}>
                  Editar
                </button>
              )}
            </div>

            <div className="profile-field-divider" />

            {/* Email field (read-only) */}
            <div className="profile-field">
              <div className="profile-field-icon-wrap profile-icon-teal">
                <IonIcon icon={mailOutline} />
              </div>
              <div className="profile-field-body">
                <p className="profile-field-label">Correo electrónico</p>
                <p className="profile-field-value">{user?.email || "No disponible"}</p>
              </div>
              <span className="profile-readonly-tag">Fijo</span>
            </div>
          </div>

          {/* ── Configuración de perfil ── */}
          <p className="profile-section-label" style={{ marginTop: "24px" }}>Configuración de perfil</p>
          <div className="profile-card">
            <button className="profile-action-row" onClick={() => history.push("/onboarding")}>
              <div className="profile-field-icon-wrap profile-icon-primary">
                <IonIcon icon={barbellOutline} />
              </div>
              <div className="profile-field-body">
                <p className="profile-field-label">Objetivo y Somatotipo</p>
                <p className="profile-field-value">{user?.objetivo}</p>
              </div>
              <IonIcon icon={chevronForwardOutline} className="profile-chevron" />
            </button>

            <div className="profile-field-divider" />

            <button className="profile-action-row" onClick={cambiarPassword}>
              <div className="profile-field-icon-wrap profile-icon-orange">
                <IonIcon icon={lockClosedOutline} />
              </div>
              <div className="profile-field-body">
                <p className="profile-field-label">Contraseña</p>
                <p className="profile-field-value">••••••••</p>
              </div>
              <IonIcon icon={chevronForwardOutline} className="profile-chevron" />
            </button>

            <div className="profile-field-divider" />

            <div className="profile-action-row" style={{ cursor: "default" }}>
              <div className="profile-field-icon-wrap profile-icon-green">
                <IonIcon icon={shieldCheckmarkOutline} />
              </div>
              <div className="profile-field-body">
                <p className="profile-field-label">Seguridad de cuenta</p>
                <p className="profile-field-value">Activa</p>
              </div>
              <span className="profile-security-badge">✓</span>
            </div>
          </div>

          {/* ── Logout ── */}
          <button className="profile-logout-btn" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} />
            Cerrar sesión
          </button>

          {/* ── Footer ── */}
          <div className="profile-footer">
            <img src="/assets/logo.png" alt="FitnessAhora" className="profile-footer-logo" />
            <p className="profile-footer-version">FitnessAhora v1.0</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;