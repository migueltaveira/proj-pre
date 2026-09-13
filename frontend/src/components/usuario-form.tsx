"use client";

import { useState } from "react";
import { Form } from "./form";
import { ErrorMessage } from "./error-message";
import { API_URL } from "@/src/lib/api";
import type { Usuario } from "@/src/lib/usuarios";

export function UsuarioForm({
  usuario,
  onSaved,
  onCancel,
}: {
  usuario: Usuario | null;
  onSaved: (usuario: Usuario) => void;
  onCancel: () => void;
}) {
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [login, setLogin] = useState(usuario?.usuario ?? "");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [ativo, setAtivo] = useState(usuario?.ativo ?? true);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const admin = usuario?.usuario === "admin";

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    if (salvando) return;
    setErro("");
    if (senha !== confirmacao) {
      setErro("A confirmação deve ser igual à senha.");
      return;
    }
    setSalvando(true);
    try {
      const response = await fetch(
        `${API_URL}/usuarios${usuario ? `/${usuario.id}` : ""}`,
        {
          method: usuario ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
          body: JSON.stringify({
            nome,
            usuario: login,
            ativo,
            ...(senha ? { senha } : {}),
          }),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setErro(
          response.status === 401
            ? "Sua sessão expirou. Entre novamente no sistema."
            : response.status === 403
              ? "Acesso exclusivo do administrador."
              : Array.isArray(data?.message)
                ? data.message.join(" ")
                : data?.message ||
                  "Não foi possível salvar o usuário. Tente novamente.",
        );
        return;
      }
      onSaved(data);
    } catch {
      setErro(
        "Não foi possível confirmar o salvamento. Verifique a conexão e a lista de usuários antes de tentar novamente.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Form
      onSubmit={salvar}
      className="app-card p-5 sm:p-8"
      aria-busy={salvando}
    >
      <h2 className="text-xl font-bold">
        {usuario ? "Editar usuário" : "Novo usuário"}
      </h2>
      <p className="mt-2 text-sm text-zinc-600">
        {admin
          ? "O login admin permanece ativo. Você pode alterar o nome e a senha."
          : "Usuários comuns acessam a produção e os cadastros, sem acesso à gestão de usuários."}
      </p>
      <fieldset disabled={salvando} className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nome" className="mb-2 block">
            Nome *
          </label>
          <input
            id="nome"
            className="app-input"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
            maxLength={100}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="login" className="mb-2 block">
            Login *
          </label>
          <input
            id="login"
            className="app-input"
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            required
            minLength={3}
            maxLength={50}
            pattern="[a-zA-Z0-9._\-]+"
            readOnly={admin}
            autoCapitalize="none"
            spellCheck={false}
            autoComplete="off"
            aria-describedby="login-hint"
          />
          <p id="login-hint" className="mt-1 text-xs text-zinc-500">
            De 3 a 50 letras, números, pontos, traços ou sublinhados. Salvo em
            minúsculas.
          </p>
        </div>
        <div>
          <label htmlFor="senha" className="mb-2 block">
            {usuario ? "Nova senha" : "Senha *"}
          </label>
          <input
            id="senha"
            type="password"
            className="app-input"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required={!usuario}
            minLength={8}
            autoComplete="new-password"
            aria-describedby="senha-hint"
          />
          <p id="senha-hint" className="mt-1 text-xs text-zinc-500">
            Mínimo de 8 caracteres.
            {usuario && " Deixe em branco para manter a senha atual."}
          </p>
        </div>
        <div>
          <label htmlFor="confirmacao" className="mb-2 block">
            Confirmar senha{(!usuario || senha) && " *"}
          </label>
          <input
            id="confirmacao"
            type="password"
            className="app-input"
            value={confirmacao}
            onChange={(event) => setConfirmacao(event.target.value)}
            required={!usuario || !!senha}
            autoComplete="new-password"
          />
        </div>
        {!admin && (
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(event) => setAtivo(event.target.checked)}
            />
            Usuário ativo
          </label>
        )}
      </fieldset>
      <ErrorMessage message={erro} />
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="submit" className="btn-primary" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar usuário"}
        </button>
        <button
          type="button"
          className="btn-voltar"
          disabled={salvando}
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </Form>
  );
}
