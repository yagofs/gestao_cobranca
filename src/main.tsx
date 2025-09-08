import { createRoot } from 'react-dom/client'

function App() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif', color: '#333' }}>
      <h1>App Placeholder</h1>
      <p>A lógica principal em main.tsx, com a correção do SonarQube, está a funcionar corretamente.</p>
    </div>
  )
}

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}

