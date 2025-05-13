import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./telas/telalogin/login.jsx";
import Home from "./telas/telainicial/home.jsx";
import Agendamento from "./telas/telaagendamento/agendamento.jsx";
import Consultas from "./telas/telaconsultas/consulta.jsx";
import Paciente from "./telas/telapacientes/paciente.jsx";
import Cadastro from "./telas/telacadastro/cadastro.jsx";
import Perfil from "./telas/telaperfil/perfil.jsx";
import ProtectedRoute from "./PrivateRoute.jsx";

function Rotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agendamento"
          element={
            <ProtectedRoute>
              <Agendamento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultas"
          element={
            <ProtectedRoute>
              <Consultas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pacientes"
          element={
            <ProtectedRoute>
              <Paciente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cadastro"
          element={
            <ProtectedRoute>
              <Cadastro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Rotas;
