import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ControlPanelPage from './pages/ControlPanelPage.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/control-panel" element={<ControlPanelPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
