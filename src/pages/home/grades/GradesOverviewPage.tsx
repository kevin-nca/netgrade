import React, { useState } from 'react';
import {
  IonContent,
  IonList,
  IonModal,
  IonPage,
  IonToast,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { add } from 'ionicons/icons';
import ValidatedNumberInput from '@/components/Form/validated-number-input/validatedNumberInput';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import GradeListItem from '@/components/List/GradeListItem';
import FormField from '@/components/Form/FormField';
import { Grade } from '@/db/entities';
import {
  useGrades,
  useDeleteGrade,
  useUpdateExamAndGrade,
} from '@/hooks/queries';
import {
  validateGrade,
  validateWeight,
  percentageToDecimal,
  decimalToPercentage,
} from '@/utils/validation';
import { useToast } from '@/hooks/useToast';
import { Layout } from '@/components/Layout/Layout';
import { Routes } from '@/routes';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, BarProps } from 'recharts';
const colors: string[] = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];

interface GradeFormData {
  examName: string;
  score: number;
  weight: number;
  date: string;
  comment: string;
}

const getPath = (x: number, y: number, width: number, height: number): string => {
  return `M${x},${y + height}
    C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
    ${x + width / 2},${y}
    C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width},${y + height}
    Z`;
};

interface TriangleBarProps extends BarProps {
  fill?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const TriangleBar: React.FC<TriangleBarProps> = ({ fill, x = 0, y = 0, width = 0, height = 0 }) => {
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};


const GradesOverviewPage: React.FC = () => {
  const history = useHistory();

  const {
    data: allGrades = [],
    error: gradesError,
    isLoading: gradesLoading,
  } = useGrades();

  const subjectAverages: { [subjectName: string]: number[] } = {};
allGrades.forEach((grade) => {
  const subject = grade.exam.subject?.name;

  if (!subjectAverages[subject]) subjectAverages[subject] = [];
  subjectAverages[subject].push(grade.score);
});

  const chartData = Object.entries(subjectAverages).map(([subject, scores]) => ({
  name: subject,
  uv: Number((scores.reduce((sum, val) => sum + val, 0) / scores.length).toFixed(1)),
}));


  const [editingId, setEditingId] = useState<string | null>(null);
  const { showToast, toastMessage, setShowToast, showMessage } = useToast();

  const gradeForm = useForm({
    defaultValues: {
      examName: '',
      score: 0,
      weight: 100,
      date: '',
      comment: '',
    } as GradeFormData,
    onSubmit: async ({ value }) => {
      if (!value.examName.trim()) {
        showMessage('Bitte geben Sie einen Prüfungsnamen ein.');
        return;
      }

      const gradeError = validateGrade(value.score);
      if (gradeError) {
        showMessage(gradeError);
        return;
      }

      const weightError = validateWeight(value.weight);
      if (weightError) {
        showMessage(weightError);
        return;
      }

      await saveEdit(value);
    },
  });

  const deleteGradeMutation = useDeleteGrade();
  const updateExamAndGradeMutation = useUpdateExamAndGrade();

  const handleDelete = (gradeId: string) => {
    deleteGradeMutation.mutate(gradeId, {
      onSuccess: () => {
        showMessage('Note erfolgreich gelöscht.');
      },
      onError: (error) => {
        showMessage(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        );
      },
    });
  };

  const startEdit = (grade: Grade) => {
    setEditingId(grade.id);
    gradeForm.setFieldValue('examName', grade.exam.name);
    gradeForm.setFieldValue('score', grade.score);
    gradeForm.setFieldValue('weight', decimalToPercentage(grade.weight));
    gradeForm.setFieldValue('date', grade.date.toISOString().split('T')[0]);
    gradeForm.setFieldValue('comment', grade.comment || '');
  };

  const saveEdit = async (formData: GradeFormData) => {
    if (!editingId) return;

    const grade = allGrades.find((grade: Grade) => grade.id === editingId);
    if (!grade) return;

    const updatedGrade = {
      ...grade,
      score: formData.score,
      weight: percentageToDecimal(formData.weight),
      date: new Date(formData.date),
      comment: formData.comment || null,
    };

    const updatedExam = {
      ...grade.exam,
      name: formData.examName,
    };
    updateExamAndGradeMutation.mutate(
      {
        examData: updatedExam,
        gradeData: updatedGrade,
      },
      {
        onSuccess: () => {
          showMessage('Note erfolgreich aktualisiert.');
          setEditingId(null);
        },
        onError: (error) => {
          showMessage(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          );
        },
      },
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <IonPage>
      <Header
        title="Notenübersicht"
        backButton
        onBack={() => window.history.back()}
        endSlot={
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={() => history.push(Routes.GRADES_ADD)}
            >
              <IonIcon icon={add} />
            </IonButton>
          </IonButtons>
        }
      />
      <IonContent>
        <Layout>
          {gradesLoading ? (
            <div className="ion-padding ion-text-center">
              <p>Noten werden geladen...</p>
            </div>
          ) : gradesError ? (
            <div className="ion-padding ion-text-center">
              <p>Fehler beim Laden der Noten.</p>
            </div>
          ) : allGrades.length === 0 ? (
            <div className="ion-padding ion-text-center">
              <p>Keine Noten gefunden.</p>
            </div>
          ) : (
            <IonList className='bar-chart-list'>
              <BarChart
                width={500}
                height={300}
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar
                  dataKey="uv"
                  fill="#8884d8"
                  label={{ position: 'top' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>

              <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={2000}
                color="danger"
              />
            </IonList>
          )}


        </Layout>
      </IonContent>
    </IonPage>
  );
};

export default GradesOverviewPage;
