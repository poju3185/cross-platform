import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProviderf } from "@/context/AuthContextf";
import { QueryProvider } from "@/lib/react-query/QueryProvider";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        {/* <AuthProvider> */}
          <AuthProviderf>
            <App />
          </AuthProviderf>
        {/* </AuthProvider> */}
      </QueryProvider>
    </BrowserRouter>
  // </React.StrictMode>
);
