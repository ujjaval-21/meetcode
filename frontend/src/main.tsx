import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider } from "./context/AuthContext";
import { EditorProvider } from "./context/EditorContext";
import { FileProvider } from "./context/FileContext";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <AuthProvider>
        <EditorProvider>
          <FileProvider>
            <App />
          </FileProvider>
        </EditorProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);