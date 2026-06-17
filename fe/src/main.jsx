import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import AppProvider from "./app/providers/AppProvider";

import "./index.css";

/* TOKENS */
import "./styles/variables.css";

/* BASE */
import "./styles/base/reset.css";
import "./styles/base/typography.css";
import "./styles/base/animations.css";
import "./styles/base/accessibility.css";

/* COMPONENTS */
import "./styles/components/button.css";
import "./styles/components/card.css";
import "./styles/components/table.css";
import "./styles/components/loader.css";

/* LAYOUT */
import "./styles/layout/layout.css";
import "./styles/layout/header.css";
import "./styles/layout/sidebar.css";
import "./styles/layout/topnav.css";
import "./styles/layout/notification.css";
import "./styles/layout/profile.css";

/* PAGES */
import "./styles/pages/auth.css";
import "./styles/pages/dashboard.css";
import "./styles/pages/notfound.css";
import "./styles/pages/asset.css";

/* UTILITIES */
import "./styles/utilities/index.css";

/* RESPONSIVE */
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);