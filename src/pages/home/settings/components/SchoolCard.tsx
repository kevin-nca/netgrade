import { IonButton, IonButtons, IonIcon, IonInput } from '@ionic/react';
import {
  checkmarkOutline,
  closeOutline,
  pencilOutline,
  trashOutline,
} from 'ionicons/icons';
import { School } from '@/db/entities';

interface SchoolCardProps {
  school: School;
  index: number;
  isExpanded: boolean;
  isEditing: boolean;
  editSchoolName: string;
  isSavePending: boolean;
  onToggle: () => void;
  onEditSchoolNameChange: (value: string) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

const SchoolCard = ({
  school,
  index,
  isExpanded,
  isEditing,
  editSchoolName,
  isSavePending,
  onToggle,
  onEditSchoolNameChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: SchoolCardProps) => {
  return (
    <div
      key={school.id}
      className={`settings-item glass-card ${isExpanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <div className="item-content">
        <div className={`item-icon school-${index % 4}`}>
          {school.name.charAt(0).toUpperCase()}
        </div>
        <div className="item-text">
          {isEditing ? (
            <div className="edit-school-input">
              <IonInput
                value={editSchoolName}
                placeholder="Schulname..."
                onIonChange={(e) =>
                  onEditSchoolNameChange(e.detail.value || '')
                }
                onClick={(e) => e.stopPropagation()}
                className="school-edit-field"
                clearInput
                autoFocus
              />
            </div>
          ) : (
            <h3 className="item-title">{school.name}</h3>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="item-extra" onClick={(e) => e.stopPropagation()}>
          <IonButtons slot="end">
            {isEditing ? (
              <div className="edit-buttons">
                <IonButton
                  className="save-button"
                  color="success"
                  onClick={onSave}
                  disabled={
                    isSavePending ||
                    !editSchoolName.trim() ||
                    editSchoolName.trim() === school.name
                  }
                >
                  <IonIcon slot="icon-only" icon={checkmarkOutline} />
                  <p className="save-text">Speichern</p>
                </IonButton>
                <IonButton
                  className="cancel-button"
                  color="medium"
                  onClick={onCancel}
                  disabled={isSavePending}
                >
                  <IonIcon slot="icon-only" icon={closeOutline} />
                  <p className="cancel-text">Abbrechen</p>
                </IonButton>
              </div>
            ) : (
              <>
                <IonButton
                  className="edit-button"
                  color="primary"
                  onClick={onEdit}
                >
                  <IonIcon slot="icon-only" icon={pencilOutline} />
                  <p className="edit-text">Bearbeiten</p>
                </IonButton>
                <IonButton
                  className="delete-button"
                  color="danger"
                  onClick={onDelete}
                >
                  <IonIcon slot="icon-only" icon={trashOutline} />
                  <p className="delete-text">Löschen</p>
                </IonButton>
              </>
            )}
          </IonButtons>
        </div>
      )}
    </div>
  );
};

export default SchoolCard;
