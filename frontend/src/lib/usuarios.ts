export type Usuario = {
  id: number;
  nome: string;
  usuario: string;
  perfil: "ADMIN" | "USUARIO";
  ativo: boolean;
};

export function podeGerenciarUsuarios(
  usuario: Pick<Usuario, "usuario" | "perfil"> | null,
) {
  return usuario?.usuario === "admin" && usuario.perfil === "ADMIN";
}
