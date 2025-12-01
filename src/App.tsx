import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Habits from './pages/Habits';
import NewHabit from './pages/NewHabit';
import EditHabit from './pages/EditHabit';
import Settings from './pages/Settings';
import Notes from './pages/Notes';
import NewNote from './pages/NewNote';
import ViewNote from './pages/ViewNote';
import Pomodoro from './pages/Pomodoro';

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
          <Route path="notes" element={<Notes />} />
          <Route path="notes/new" element={<NewNote />} />
          <Route path="notes/:id" element={<ViewNote />} />
          <Route path="pomodoro" element={<Pomodoro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
