import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { EditorProvider } from "./context/EditorContext";

import App from "./App";
import "./index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <EditorProvider>
        <App />
      </EditorProvider>
    </AuthProvider>
  </BrowserRouter>
);