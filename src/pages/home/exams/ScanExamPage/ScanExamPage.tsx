import React, { useRef, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner,
  IonToast,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  addOutline,
  cameraOutline,
  checkmarkCircleOutline,
  trophyOutline,
} from 'ionicons/icons';
import { format } from 'date-fns';
import Header from '@/components/Header/Header';
import FormContainer from '@/shared/components/form-layout/form-container';
import { useAppForm } from '@/shared/components/form';
import {
  useAnalyzeScan,
  useCreateExamFromScan,
  useSubjects,
  useTakeExamPhoto,
} from '@/hooks';
import { Routes } from '@/routes';
import { percentageToDecimal } from '@/utils/validation';
import type { Subject } from '@/db/entities';
import './ScanExamPage.css';

interface ScanFormData {
  selectedSubject: unknown;
  examName: string;
  date: string;
  score: number | undefined;
  pointsAchieved: string;
  pointsMax: string;
  weight: string;
}

const ScanExamPage: React.FC = () => {
  const router = useIonRouter();
  const autoStartedRef = useRef(false);

  const { data: subjects = [] } = useSubjects();
  const takePhotoMutation = useTakeExamPhoto();
  const analyzeScanMutation = useAnalyzeScan();
  const createExamMutation = useCreateExamFromScan();

  const [analyzing, setAnalyzing] = useState(false);
  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(
    null,
  );

  const goHome = () => router.push(Routes.HOME, 'back', 'pop');

  const form = useAppForm({
    defaultValues: {
      selectedSubject: null,
      examName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      score: undefined,
      pointsAchieved: '',
      pointsMax: '',
      weight: '100',
    } as ScanFormData,
    onSubmit: async ({ value }) => {
      const subject = value.selectedSubject as Subject | null;
      if (!subject) {
        setToast({ msg: 'Bitte ein Fach auswählen', color: 'warning' });
        return;
      }
      if (!value.examName.trim()) {
        setToast({
          msg: 'Bitte einen Prüfungsnamen eingeben',
          color: 'warning',
        });
        return;
      }

      try {
        const examId = await createExamMutation.mutateAsync({
          subjectId: subject.id,
          name: value.examName.trim(),
          date: new Date(value.date + 'T12:00:00'),
          weight: percentageToDecimal(Number(value.weight) || 100),
          score: value.score && value.score >= 1 ? value.score : null,
          pointsAchieved: value.pointsAchieved.trim()
            ? Number(value.pointsAchieved.replace(',', '.'))
            : null,
          pointsMax: value.pointsMax.trim()
            ? Number(value.pointsMax.replace(',', '.'))
            : null,
          photoPaths,
        });

        router.push(
          Routes.EXAM_EDIT.replace(':examId', examId),
          'forward',
          'replace',
        );
      } catch (err) {
        setToast({ msg: `Fehler: ${(err as Error).message}`, color: 'danger' });
      }
    },
  });

  const handleScan = async (auto = false) => {
    let paths: string[];
    try {
      paths = await takePhotoMutation.mutateAsync();
    } catch {
      if (auto) goHome();
      return;
    }
    if (!paths.length) {
      if (auto) goHome();
      return;
    }
    setPhotoPaths((prev) => [...prev, ...paths]);

    setAnalyzing(true);
    try {
      const result = await analyzeScanMutation.mutateAsync(paths[0]);
      if (result.examName) form.setFieldValue('examName', result.examName);
      if (result.date) form.setFieldValue('date', result.date);
      if (result.score != null) form.setFieldValue('score', result.score);
      if (result.pointsAchieved != null)
        form.setFieldValue('pointsAchieved', String(result.pointsAchieved));
      if (result.pointsMax != null)
        form.setFieldValue('pointsMax', String(result.pointsMax));
    } catch {
      setToast({
        msg: 'KI-Analyse nicht verfügbar – bitte Felder manuell ausfüllen.',
        color: 'warning',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  useIonViewWillEnter(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    handleScan(true);
  });

  const scanning = takePhotoMutation.isPending || analyzing;

  return (
    <IonPage>
      <Header title="Prüfung scannen" backButton onBack={goHome} />
      <IonContent scrollY>
        <FormContainer>
          <IonButton
            expand="block"
            className="scan-page-button"
            onClick={() => handleScan()}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <IonSpinner name="crescent" slot="start" />
                {analyzing ? 'KI analysiert...' : 'Scanner wird geöffnet...'}
              </>
            ) : (
              <>
                <IonIcon icon={cameraOutline} slot="start" />
                {photoPaths.length
                  ? 'Weitere Seite scannen'
                  : 'Prüfung scannen'}
              </>
            )}
          </IonButton>

          {photoPaths.length > 0 && (
            <p
              className="ion-text-center"
              style={{ color: 'var(--ion-color-medium)', margin: '8px 0 4px' }}
            >
              {photoPaths.length} Seite(n) gescannt
            </p>
          )}

          <form.AppField name="selectedSubject">
            {(field) => (
              <field.SubjectSelectField
                label="Fach"
                subjects={subjects ?? []}
              />
            )}
          </form.AppField>

          <form.AppField name="examName">
            {(field) => <field.ExamNameField label="Prüfungsname" />}
          </form.AppField>

          <form.AppField name="date">
            {(field) => <field.DateField label="Datum" />}
          </form.AppField>

          <form.AppField name="score">
            {(field) => <field.GradeScoreField label="Note (1-6)" />}
          </form.AppField>

          <form.AppField name="pointsAchieved">
            {(field) => (
              <field.PointsField
                label="Punkte erreicht"
                htmlFor="points-achieved"
                icon={checkmarkCircleOutline}
                placeholder="z.B. 19"
              />
            )}
          </form.AppField>

          <form.AppField name="pointsMax">
            {(field) => (
              <field.PointsField
                label="Punkte maximal"
                htmlFor="points-max"
                icon={trophyOutline}
                placeholder="z.B. 20"
              />
            )}
          </form.AppField>

          <form.AppField name="weight">
            {(field) => <field.WeightField label="Gewichtung (0-100%)" />}
          </form.AppField>
        </FormContainer>

        <div style={{ padding: '8px 16px 32px' }}>
          <IonButton
            expand="block"
            className="scan-page-button"
            onClick={() => form.handleSubmit()}
            disabled={createExamMutation.isPending}
          >
            {createExamMutation.isPending ? (
              <>
                <IonSpinner name="crescent" slot="start" />
                Wird gespeichert...
              </>
            ) : (
              <>
                <IonIcon icon={addOutline} slot="start" />
                Prüfung speichern
              </>
            )}
          </IonButton>
        </div>

        <IonToast
          isOpen={!!toast}
          onDidDismiss={() => setToast(null)}
          message={toast?.msg}
          color={toast?.color}
          duration={2500}
          position="top"
        />
      </IonContent>
    </IonPage>
  );
};

export default ScanExamPage;
