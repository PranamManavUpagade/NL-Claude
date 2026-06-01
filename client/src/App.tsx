import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import NewEvaluation from './pages/NewEvaluation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evaluate/new" element={<NewEvaluation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
