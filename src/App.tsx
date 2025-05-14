import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Form from "./pages/Form";
import Reports from "./pages/Reports";
import Clients from "./pages/Clients";

function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home/*" element={<Home />}>
          <Route index element={<Form />} />
          <Route path="form" element={<Form />} />
          <Route path="report" element={<Reports />} />
          <Route path="client" element={<Clients />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
