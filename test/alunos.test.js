import request from "supertest";
import { expect } from "chai";
import app from "../src/app.js";
import { loginAdmin, loginAluno } from "./helpers/auth.helper.js";
import alunosData from "./data/alunos.json" with { type: "json" };

describe("POST /api/admin/alunos", () => {
  alunosData.forEach((dados, index) => {
    it(`deve cadastrar o aluno ${dados.nome}`, async () => {
      const adminToken = await loginAdmin(app);

      const identificador = `${Date.now()}-${index}`;

      const aluno = {
        nome: dados.nome,
        email: `${dados.emailBase}.${identificador}@example.com`,
        matricula: `${dados.matriculaBase}${identificador}`,
        senha: dados.senha,
      };

      const resposta = await request(app)
        .post("/api/admin/alunos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(aluno);

      expect(resposta.status).to.equal(201);
      expect(resposta.headers["content-type"]).to.include("application/json");

      expect(resposta.body).to.have.property("id");
      expect(resposta.body.nome).to.equal(aluno.nome);
      expect(resposta.body.email).to.equal(aluno.email);
      expect(resposta.body.matricula).to.equal(aluno.matricula);

      expect(resposta.body).to.not.have.property("senha");

      const respostaMatricula = await request(app)
        .post(`/api/admin/disciplinas/${dados.disciplinaId}/matriculas`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          alunoId: resposta.body.id,
        });

      expect(respostaMatricula.status).to.equal(201);
      expect(respostaMatricula.body).to.have.property("id");
      expect(respostaMatricula.body.alunoId).to.equal(resposta.body.id);
      expect(respostaMatricula.body.disciplinaId).to.equal(dados.disciplinaId);

      const alunoToken = await loginAluno(app, aluno.email, aluno.senha);

      expect(alunoToken).to.be.a("string");
      expect(alunoToken).to.not.be.empty;

      const respostaTrabalho = await request(app)
        .post(`/api/alunos/${resposta.body.id}/trabalhos`)
        .set("Authorization", `Bearer ${alunoToken}`)
        .send({
          disciplinaId: dados.disciplinaId,
          titulo: dados.tituloTrabalho,
          descricao: dados.descricaoTrabalho,
        });

      expect(respostaTrabalho.status).to.equal(201);
      expect(respostaTrabalho.body).to.have.property("id");
      expect(respostaTrabalho.body.alunoId).to.equal(resposta.body.id);
      expect(respostaTrabalho.body.disciplinaId).to.equal(dados.disciplinaId);
      expect(respostaTrabalho.body.titulo).to.equal(dados.tituloTrabalho);
      expect(respostaTrabalho.body.status).to.equal("entregue");
    });
  });
});
