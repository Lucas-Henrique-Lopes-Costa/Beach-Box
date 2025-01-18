import React from "react";

const HomePage: React.FC = () => {
  const team = [
    { name: "Lucas Henrique", matricula: "123456" },
    { name: "Thiago Lima Pereira", matricula: "789012" }
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        backgroundColor: "#f4f4f9",
        margin: 0,
        padding: 0,
        color: "#333",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "#fff",
          padding: "20px 40px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          Bem-vindos à Beach Box
        </h1>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {team.map((member, index) => (
            <li key={index} style={{ margin: "5px 0", fontSize: "1.2rem" }}>
              <strong>{member.name}:</strong> Matrícula {member.matricula}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
