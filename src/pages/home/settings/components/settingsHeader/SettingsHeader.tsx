import { useHistory } from 'react-router-dom';
import Header from '@/components/Header/Header';
import { Routes } from '@/routes';

const SettingsHeader = () => {
  const history = useHistory();

  return (
    <Header
      title="Einstellungen"
      backButton={true}
      defaultHref={Routes.HOME}
      onBack={() => history.replace(Routes.HOME)}
    />
  );
};

export default SettingsHeader;
