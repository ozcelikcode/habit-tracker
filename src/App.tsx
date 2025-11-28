import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Habits from './pages/Habits';
import NewHabit from './pages/NewHabit';
import EditHabit from './pages/EditHabit';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="habits" element={<Habits />} />
          <Route path="habits/new" element={<NewHabit />} />
          <Route path="habits/:id/edit" element={<EditHabit />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
