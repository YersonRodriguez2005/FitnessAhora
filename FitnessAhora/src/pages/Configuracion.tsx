import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon, useIonToast } from '@ionic/react';
import { saveOutline, bodyOutline, optionsOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Configuracion: React.FC = () => {
  const { user, setUser } = useAuth(); // Necesitarás agregar setUser al Context
  const [somatotipo, setSomatotipo] = useState(user?.somatotipo || 'Ectomorfo');
  const [objetivo, setObjetivo] = useState(user?.objetivo || 'Aumento de Masa Muscular');
  const [present] = useIonToast();

  const guardarCambios = async () => {
    try {
      await api.put(`/update-profile/${user?.id}`, { somatotipo, objetivo });
      
      // Actualizamos el estado local
      const newUser = { ...user!, somatotipo, objetivo };
      setUser(newUser);
      localStorage.setItem('fitness_user', JSON.stringify(newUser));

      present({
        message: '¡Perfil actualizado! Tus rutinas y dieta se han reajustado.',
        duration: 2000,
        color: 'success'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Configurar Perfil</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonIcon icon={bodyOutline} slot="start" />
          <IonLabel>Mi Somatotipo</IonLabel>
          <IonSelect value={somatotipo} onIonChange={e => setSomatotipo(e.detail.value)}>
            <IonSelectOption value="Ectomorfo">Ectomorfo</IonSelectOption>
            <IonSelectOption value="Mesomorfo">Mesomorfo</IonSelectOption>
            <IonSelectOption value="Endomorfo">Endomorfo</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem style={{ marginTop: '15px' }}>
          <IonIcon icon={optionsOutline} slot="start" />
          <IonLabel>Mi Objetivo</IonLabel>
          <IonSelect value={objetivo} onIonChange={e => setObjetivo(e.detail.value)}>
            <IonSelectOption value="Aumento de Masa Muscular">Volumen (Masa)</IonSelectOption>
            <IonSelectOption value="Bajar de peso">Definición (Perder peso)</IonSelectOption>
          </IonSelect>
        </IonItem>

      <IonButton expand="block" style={{ marginTop: '30px' }} onClick={guardarCambios}>
        <IonIcon icon={saveOutline} slot="start" /> Guardar Cambios
      </IonButton>
    </IonContent>
  </IonPage>
);
};

export default Configuracion;