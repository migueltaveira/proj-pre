"use client";

import { useCallback, useRef, useState } from "react";
import { AppHeader } from "@/src/components/app-header";
import { UsuarioForm } from "@/src/components/usuario-form";
import { ErrorMessage } from "@/src/components/error-message";
import { useLoadData } from "@/src/hooks/use-load-data";
import { API_URL } from "@/src/lib/api";
import { podeGerenciarUsuarios, type Usuario } from "@/src/lib/usuarios";
import Link from "next/link";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [busca, setBusca] = useState("");
  const [editor, setEditor] = useState<Usuario | null | undefined>(undefined);
  const formulario = useRef<HTMLDivElement>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    setAutorizado(false);
    try {
      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Entre com o login admin para gerenciar usuários.");
      const headers = { Authorization: `Bearer ${token}` };
      const me = await fetch(`${API_URL}/usuarios/me`, { headers });
      if (!me.ok)
        throw new Error(
          "Sua sessão expirou. Entre novamente com o login admin.",
        );
      if (!podeGerenciarUsuarios((await me.json()).usuario))
        throw new Error("Acesso exclusivo do login admin.");
      const response = await fetch(`${API_URL}/usuarios`, { headers });
      if (!response.ok)
        throw new Error(
          response.status === 403
            ? "Acesso exclusivo do login admin."
            : "Não foi possível carregar os usuários. Tente novamente.",
        );
      setUsuarios(await response.json());
      setAutorizado(true);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar ao servidor.",
      );
    } finally {
      setCarregando(false);
    }
  }, []);
  useLoadData(carregar);

  function abrir(usuario: Usuario | null) {
    setSucesso("");
    setEditor(usuario);
    requestAnimationFrame(() => formulario.current?.focus());
  }

  function salvo(usuario: Usuario) {
    setUsuarios((current) =>
      [...current.filter((item) => item.id !== usuario.id), usuario].sort(
        (a, b) => a.nome.localeCompare(b.nome),
      ),
    );
    setEditor(undefined);
    setSucesso("Usuário salvo com sucesso.");
  }

  const filtrados = usuarios.filter((item) =>
    `${item.nome} ${item.usuario}`.toLowerCase().includes(busca.toLowerCase()),
  );
  return (
    <main className="app-page">
      <AppHeader title="Usuários" backHref="/dashboard" />
      <div
        id="conteudo"
        tabIndex={-1}
        className="mx-auto max-w-5xl space-y-5 px-4 py-6"
      >
        {carregando ? (
          <p role="status">Verificando acesso e carregando usuários...</p>
        ) : !autorizado ? (
          <section className="app-card p-5">
            <ErrorMessage message={erro} />
            <div className="flex flex-wrap gap-3">
              <button className="btn-voltar" onClick={carregar}>
                Tentar novamente
              </button>
              <Link className="btn-primary" href="/">
                Ir para o login
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gerenciar acessos</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Cadastre, edite e controle quem pode utilizar o sistema.
                </p>
              </div>
              <button className="btn-primary" onClick={() => abrir(null)}>
                + Novo usuário
              </button>
            </div>
            {sucesso && (
              <p
                role="status"
                className="rounded-xl bg-green-50 p-4 text-green-800"
              >
                {sucesso}
              </p>
            )}
            {editor !== undefined && (
              <div ref={formulario} tabIndex={-1}>
                <UsuarioForm
                  key={editor?.id ?? "novo"}
                  usuario={editor}
                  onSaved={salvo}
                  onCancel={() => setEditor(undefined)}
                />
              </div>
            )}
            <input
              aria-label="Buscar usuário por nome ou login"
              placeholder="Buscar por nome ou login"
              className="app-input"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
            <div className="space-y-3">
              {filtrados.map((usuario) => (
                <article
                  key={usuario.id}
                  className="app-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-bold">{usuario.nome}</h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {usuario.usuario} ·{" "}
                      {usuario.perfil === "ADMIN" ? "Administrador" : "Usuário"}
                    </p>
                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${usuario.ativo ? "bg-green-100 text-green-800" : "bg-zinc-200 text-zinc-700"}`}
                    >
                      {usuario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <button
                    className="btn-voltar"
                    onClick={() => abrir(usuario)}
                    aria-label={`Editar ${usuario.nome}`}
                  >
                    Editar acesso
                  </button>
                </article>
              ))}
            </div>
            {!filtrados.length && (
              <p className="app-card p-5 text-zinc-600">
                Nenhum usuário encontrado.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
