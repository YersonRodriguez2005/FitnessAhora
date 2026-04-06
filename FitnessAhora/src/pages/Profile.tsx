import React, { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonAvatar,
  useIonToast,
  useIonAlert,
  IonList,
  IonSpinner,
} from "@ionic/react";
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  logOutOutline,
  saveOutline,
  cameraOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import { useHistory } from "react-router-dom";
import api from "../services/api";

const Profile: React.FC = () => {
  const { user, setUser, logout } = useAuth();
  const history = useHistory();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const [nombre, setNombre] = useState(user?.nombre || "");
  const [isSaving, setIsSaving] = useState(false);

  // Función para cerrar sesión de forma segura
  const handleLogout = () => {
    presentAlert({
      header: "Cerrar Sesión",
      message: "¿Estás seguro de que deseas salir de tu cuenta?",
      buttons: [
        { text: "Cancelar", role: "cancel", cssClass: "secondary" },
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

  // Función para actualizar datos básicos (Nombre)
  const guardarCambios = async () => {
    if (!nombre.trim()) {
      presentToast({
        message: "El nombre no puede estar vacío",
        duration: 2000,
        color: "warning",
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/update-account/${user?.id}`, { nombre });

      const newUser = { ...user!, nombre };
      setUser(newUser);
      localStorage.setItem("fitness_user", JSON.stringify(newUser));

      presentToast({
        message: "Datos actualizados correctamente",
        duration: 2000,
        color: "success",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      presentToast({
        message: "Hubo un inconveniente al actualizar los datos",
        duration: 2000,
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Función para solicitar cambio de contraseña (Abre un alert interactivo)
  const cambiarPassword = () => {
    presentAlert({
      header: "Cambiar Contraseña",
      inputs: [
        {
          name: "oldPassword",
          type: "password",
          placeholder: "Contraseña Actual",
        },
        {
          name: "newPassword",
          type: "password",
          placeholder: "Nueva Contraseña",
        },
      ],
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Actualizar",
          handler: async (data) => {
            if (!data.oldPassword || !data.newPassword) {
              presentToast({
                message: "Ambos campos son obligatorios",
                duration: 2000,
                color: "warning",
              });
              return false;
            }
            try {
              await api.put(`/change-password/${user?.id}`, data);
              presentToast({
                message: "Contraseña actualizada con éxito",
                duration: 2000,
                color: "success",
              });
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              presentToast({
                message:
                  error.response?.data?.mensaje ||
                  "La contraseña actual es incorrecta",
                duration: 2500,
                color: "danger",
              });
              return false;
            }
          },
        },
      ],
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mi Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Avatar y Encabezado */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "20px 0",
          }}
        >
          <div style={{ position: "relative" }}>
            <IonAvatar
              style={{
                width: "100px",
                height: "100px",
                border: "3px solid var(--ion-color-primary)",
              }}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${user?.nombre}&background=random&color=fff&size=100`}
                alt="Avatar"
              />
            </IonAvatar>
            <IonButton
              size="small"
              shape="round"
              style={{ position: "absolute", bottom: "-10px", right: "-10px" }}
              onClick={() =>
                presentToast({
                  message: "Gestión de avatar en construcción",
                  duration: 2000,
                })
              }
            >
              <IonIcon icon={cameraOutline} slot="icon-only" />
            </IonButton>
          </div>
          <h2
            style={{
              marginTop: "15px",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            {user?.nombre}
          </h2>
          <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>
            {user?.somatotipo} | {user?.objetivo}
          </p>
        </div>

        {/* Tarjeta de Datos Personales */}
        <IonCard style={{ marginBottom: "20px" }}>
          <IonCardHeader>
            <IonCardTitle
              style={{
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <IonIcon icon={personOutline} color="primary" />
              Datos Personales
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList
              lines="none"
              style={{ padding: 0, background: "transparent" }}
            >
              <IonItem style={{ "--padding-start": "0" }}>
                <IonInput
                  label="Nombre Completo"
                  labelPlacement="floating"
                  value={nombre}
                  onIonInput={(e) => setNombre(e.detail.value!)}
                />
              </IonItem>
              <IonItem style={{ "--padding-start": "0", marginTop: "10px" }}>
                <IonIcon
                  icon={mailOutline}
                  slot="start"
                  color="medium"
                  style={{ marginRight: "10px" }}
                />
                <IonLabel color="medium">
                  <p>Correo electrónico</p>
                  <h3 style={{ color: "var(--ion-color-dark)" }}>
                    {user?.email || "No disponible"}
                  </h3>
                </IonLabel>
              </IonItem>
            </IonList>
            <IonButton
              expand="block"
              style={{ marginTop: "20px" }}
              onClick={guardarCambios}
              disabled={isSaving}
            >
              {isSaving ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon icon={saveOutline} slot="start" /> Guardar Cambios
                </>
              )}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Tarjeta de Seguridad */}
        <IonCard style={{ marginBottom: "20px" }}>
          <IonCardHeader>
            <IonCardTitle
              style={{
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <IonIcon icon={lockClosedOutline} color="warning" />
              Seguridad
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p
              style={{ color: "var(--ion-color-medium)", marginBottom: "15px" }}
            >
              Te recomendamos cambiar tu contraseña periódicamente para mantener
              tu cuenta segura.
            </p>
            <IonButton
              expand="block"
              fill="outline"
              color="dark"
              onClick={cambiarPassword}
            >
              Actualizar Contraseña
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Botón de Cierre de Sesión */}
        <IonButton
          expand="block"
          color="danger"
          fill="solid"
          style={{ marginTop: "30px", marginBottom: "40px" }}
          onClick={handleLogout}
        >
          <IonIcon icon={logOutOutline} slot="start" />
          Cerrar Sesión
        </IonButton>

        <div style={{ textAlign: "center", marginTop: "40px", opacity: 0.5 }}>
          <img
            src="/assets/logo.png"
            alt="Logo"
            style={{ height: "50px" }}
          />
          <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            FitnessAhora v1.0
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
