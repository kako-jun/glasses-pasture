import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useUserStore } from './stores/userStore';
import { usersApi, glassesApi } from './api/client';
import EntrancePage from './pages/EntrancePage';
import ScreeningPage from './pages/ScreeningPage';
import PasturePage from './pages/PasturePage';
import StablePage from './pages/StablePage';
import GambitPage from './pages/GambitPage';
import Layout from './components/Layout';

function App() {
  const { userId, setUserId, screeningPassed, setScreeningPassed, setGlasses } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        // Create or get user
        const userResult = await usersApi.createOrGet(userId || undefined);
        if (userResult.data) {
          setUserId(userResult.data.id);
          setScreeningPassed(userResult.data.screeningPassed);

          // If screening passed, try to get glasses
          if (userResult.data.screeningPassed) {
            const glassesResult = await glassesApi.getByUser(userResult.data.id);
            if (glassesResult.data) {
              setGlasses(glassesResult.data as any);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--color-text-secondary)'
      }}>
        ...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<EntrancePage />} />
      <Route path="/screening" element={<ScreeningPage />} />
      <Route element={<Layout />}>
        <Route
          path="/pasture"
          element={screeningPassed ? <PasturePage /> : <Navigate to="/" />}
        />
        <Route
          path="/stable"
          element={screeningPassed ? <StablePage /> : <Navigate to="/" />}
        />
        <Route
          path="/stable/:glassesId"
          element={screeningPassed ? <StablePage /> : <Navigate to="/" />}
        />
        <Route
          path="/gambit"
          element={screeningPassed ? <GambitPage /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  );
}

export default App;
