import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './styles/app.css';
import './styles/reader.css';
import { PrefsProvider } from './app/prefs';
import { Layout } from './app/Layout';
import { HomePage } from './pages/HomePage';
import { QuestionPage } from './pages/QuestionPage';
import { QuestionsIndex, ComparePositions, SearchPage } from './pages/Index';
import { IntersectionsPage } from './pages/IntersectionsPage';
import { TracerPage } from './pages/Tracer';
import { About, Concept, Terms, Thinker, YourPositions } from './pages/Misc';

// Hash routing so the static build works from any path — a project subpath on Pages,
// a domain root, or file:// — with no server rewrite rules for deep links.
const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },

      { path: 'questions', element: <QuestionsIndex /> },
      // `compare` and `locate` are declared before `:position` so they are not read as
      // position slugs.
      { path: 'questions/:slug/compare', element: <ComparePositions /> },
      { path: 'questions/:slug/locate', element: <TracerPage /> },
      { path: 'questions/:slug/:position', element: <QuestionPage /> },
      { path: 'questions/:slug', element: <QuestionPage /> },

      { path: 'intersections', element: <IntersectionsPage /> },
      { path: 'thinkers/:slug', element: <Thinker /> },
      { path: 'terms', element: <Terms /> },
      { path: 'terms/:slug', element: <Concept /> },
      { path: 'positions/mine', element: <YourPositions /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'about', element: <About /> },

      // Phase 1 URLs, kept working rather than broken.
      { path: 'yours', element: <YourPositions /> },
      { path: 'positions/:slug', element: <RedirectPosition /> },
    ],
  },
]);

import { Navigate, useParams } from 'react-router-dom';
import { graph } from './app/graph';
import { positionBySlug, positionPath } from './graph/slugs';

/** A Phase 1 `/positions/:id` link now resolves to the position under its question. */
function RedirectPosition() {
  const { slug = '' } = useParams();
  const p = positionBySlug(graph, slug);
  return <Navigate to={p ? positionPath(graph, p) : '/questions'} replace />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrefsProvider>
      <RouterProvider router={router} />
    </PrefsProvider>
  </StrictMode>,
);
