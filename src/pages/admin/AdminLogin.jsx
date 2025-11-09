import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAdminSession, loginAdmin } from "@/api/admin";

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState(null);

  const {
    data: session,
    isLoading,
  } = useQuery({
    queryKey: ["admin", "session"],
    queryFn: getAdminSession,
    retry: false,
  });

  const isAuthenticated = Boolean(session?.authenticated ?? session?.user);

  const loginMutation = useMutation({
    mutationFn: loginAdmin,
    onSuccess: async () => {
      setFeedback({ type: "success", message: "Login realizado com sucesso" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "session"] });
      const redirectTo = location.state?.from?.pathname ?? "/admin/catalogo";
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      setFeedback({ type: "error", message: error.message });
    },
  });

  useEffect(() => {
    if (feedback) {
      const timeout = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [feedback]);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin/catalogo" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      // feedback handled by onError
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth__panel">
        <h1>Painel administrativo</h1>
        <p>Informe suas credenciais para acessar o catálogo.</p>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label className="admin-form__field">
            <span>E-mail</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="admin-form__field">
            <span>Senha</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="btn" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
        {feedback ? (
          <div className={`admin-feedback admin-feedback--${feedback.type}`}>
            {feedback.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
