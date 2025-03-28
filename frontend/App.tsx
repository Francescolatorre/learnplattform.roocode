import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import routes from './app/routes';

const router = createBrowserRouter(routes, {
    future: {
        v7_startTransition: true, // Enable startTransition future flag
        v7_relativeSplatPath: true, // Enable relativeSplatPath future flag
    },
});

const App = () => (
    <BrowserRouter>
        <RouterProvider router={router} />
    </BrowserRouter>
);

export default App;
