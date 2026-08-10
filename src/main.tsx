import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './styles/app.css';
import { PrefsProvider } from './app/prefs';
import { Layout } from './app/Layout';
import { Home } from './pages/Home';
import { Question } from './pages/Question';
import { Position } from './pages/Position';
import { Intersections } from './pages/Intersections';
import { TracerPage } from './pages/Tracer';
import { About, Concept, Terms, Thinker, YourPositions } from './pages/Misc';

// Hash routing so the static build works when served from any path, including
// file:// and subdirectory deploys, with no server rewrite rules.
const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'questions/:id', element: <Question /> },
      { path: 'questions/:id/tracer', element: <TracerPage /> },
      { path: 'positions/:id', element: <Position /> },
      { path: 'intersections', element: <Intersections /> },
      { path: 'thinkers/:id', element: <Thinker /> },
      { path: 'terms', element: <Terms /> },
      { path: 'terms/:id', element: <Concept /> },
      { path: 'yours', element: <YourPositions /> },
      { path: 'about', element: <About /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrefsProvider>
      <RouterProvider router={router} />
    </PrefsProvider>
  </StrictMode>,
);
