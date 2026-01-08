import React from 'react';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import { DownloadHistoryWindow } from './components/DownloadHistoryWindow';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <FluentProvider theme={teamsLightTheme}>
      <DownloadHistoryWindow />
    </FluentProvider>
  );
};

export default App;
