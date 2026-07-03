
import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./styles/index.css";
import { db } from "./lib/database";

(async () => {
  await db.open();
  createRoot(document.getElementById("root")!).render(<App />);
})();

