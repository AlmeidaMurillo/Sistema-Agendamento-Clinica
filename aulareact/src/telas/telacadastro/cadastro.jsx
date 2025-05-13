import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./cadastro.css";

function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [telefone, setTelefone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/pacientes", {
        nome,
        dataNascimento,
        telefone,
      });
      if (response.data.success) {
        alert("Paciente cadastrado com sucesso!");
        navigate("/pacientes");
      } else {
        alert("Erro ao cadastrar paciente: " + response.data.message);
      }
    } catch (error) {
      alert("Erro de conexão. Tente novamente!");
      console.error("Erro ao cadastrar paciente", error);
    }
  };

  const handleVoltar = () => {
    navigate("/pacientes")
  }

  return (
    <div className="cadastrar-paciente-container">
      <div className="main-contentcadastro">
        <i className="fas fa-arrow-left" onClick={handleVoltar}></i>
        <h2 className="titlecadastro">Cadastrar Paciente</h2>

        <form onSubmit={handleSubmit} className="formcadastro">
          <div className="form-groupcadastro">
            <label htmlFor="nome">Nome:</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-groupcadastro">
            <label htmlFor="dataNascimento">Data de Nascimento:</label>
            <input
              type="date"
              id="dataNascimento"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              required
            />
          </div>

          <div className="form-groupcadastro">
            <label htmlFor="telefone">Telefone:</label>
            <input
              type="text"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btncadastro">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;
