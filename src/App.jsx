import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/ToastProvider.jsx';
import ControlPanelPage from './pages/ControlPanelPage.jsx';
import DeletedTasksPage from './pages/DeletedTasksPage.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/control-panel" element={<ControlPanelPage />} />
          <Route path="/deleted" element={<DeletedTasksPage />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
