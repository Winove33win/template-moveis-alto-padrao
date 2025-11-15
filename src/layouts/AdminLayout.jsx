import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clearAdminToken, getAdminSession, logoutAdmin } from "@/api/admin";

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState(null);

  const {
    data: session,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "session"],
    queryFn: getAdminSession,
    retry: false,
  });

  const isAuthenticated = Boolean(session?.authenticated ?? session?.user);

  useEffect(() => {
    if (isError && error?.status === 401) {
      clearAdminToken();
    }
  }, [isError, error]);

  const logoutMutation = useMutation({
    mutationFn: logoutAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "session"] });
      navigate("/admin/login");
    },
    onError: (error) => {
      setFeedback({ type: "error", message: error.message });
    },
  });

  if (isLoading) {
    return (
      <div className="admin-shell">
        <div className="admin-shell__loading">Verificando sessão...</div>
      </div>
    );
  }

  if (isError || !isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const handleLogout = async () => {
    setFeedback(null);
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // handled by mutation onError
    }
  };

  return (
    <div className="admin-shell">
      <header className="admin-shell__header">
        <div className="admin-shell__header-inner">
          <Link to="/admin/catalogo" className="admin-shell__brand">
            Painel Administrativo
          </Link>
          <div className="admin-shell__spacer" />
          <span className="admin-shell__user">{session.user?.name ?? session.user?.email ?? "Usuário"}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Saindo..." : "Sair"}
          </button>
        </div>
        {feedback ? (
          <div className={`admin-shell__feedback admin-shell__feedback--${feedback.type}`}>
            {feedback.message}
          </div>
        ) : null}
      </header>
      <main className="admin-shell__main">
        <Outlet context={{ session }} />
      </main>
    </div>
  );
}

export default AdminLayout;
