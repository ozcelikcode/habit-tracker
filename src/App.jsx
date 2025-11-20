import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ControlPanelPage from './pages/ControlPanelPage.jsx';
import DeletedTasksPage from './pages/DeletedTasksPage.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/control-panel" element={<ControlPanelPage />} />
        <Route path="/deleted" element={<DeletedTasksPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
