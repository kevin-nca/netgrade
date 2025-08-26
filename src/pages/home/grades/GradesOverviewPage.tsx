import {
  IonContent,
  IonList,
  IonPage,
  IonToast,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { add } from 'ionicons/icons';
import Header from '@/components/Header/Header';
import { useGrades } from '@/hooks/queries';
import {} from '@/utils/validation';
import { useToast } from '@/hooks/useToast';
import { Layout } from '@/components/Layout/Layout';
import { Routes } from '@/routes';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
const colors: string[] = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  'red',
  'pink',
];

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

  const chartData = Object.entries(subjectAverages).map(
    ([subject, scores]) => ({
      name: subject,
      uv: Number(
        (scores.reduce((sum, val) => sum + val, 0) / scores.length).toFixed(1),
      ),
    }),
  );

  const { showToast, toastMessage, setShowToast } = useToast();

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
            <IonList className="bar-chart-list">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
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
                  <Bar dataKey="uv" fill="#8884d8" label={{ position: 'top' }}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

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
