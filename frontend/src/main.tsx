import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Handle dynamic import errors (mostly for deployment updates)
window.addEventListener('error', (event) => {
    const isChunkError = /Loading chunk [\d]+ failed/.test(event.message);
    const isModuleError = /Failed to fetch dynamically imported module/.test(event.message);

    if (isChunkError || isModuleError) {
        // Prevent infinite reload loop
        const lastReload = sessionStorage.getItem('last_deployment_reload');
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload) > 10000) {
            console.warn('Deployment update detected, reloading app...');
            sessionStorage.setItem('last_deployment_reload', now.toString());
            window.location.reload();
        }
    }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
