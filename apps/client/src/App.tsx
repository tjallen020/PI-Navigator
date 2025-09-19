import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { FastTrackPage } from './pages/FastTrackPage';
import { GuidedPage } from './pages/GuidedPage';
import { FacilitatorPage } from './pages/FacilitatorPage';
import { DecisionTreePage } from './pages/DecisionTreePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<FastTrackPage />} />
        <Route path="/guided" element={<GuidedPage />} />
        <Route path="/facilitator" element={<FacilitatorPage />} />
        <Route path="/decision-tree" element={<DecisionTreePage />} />
      </Routes>
    </Layout>
  );
}

export default App;
