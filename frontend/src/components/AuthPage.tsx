import React, { useState } from "react";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Film, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthPageProps {
  showToast: (type: "success" | "error", text: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ showToast }) => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!nome.trim()) {
          throw new Error("Por favor, informe seu nome.");
        }
        await register(nome, email, password);
        showToast("success", "Conta criada com sucesso! Bem-vindo ao CineHanks.");
      } else {
        await login(email, password);
        showToast("success", "Login realizado com sucesso!");
      }
    } catch (err: any) {
      const msg = err.message || "Ocorreu um erro ao processar sua solicitação.";
      setError(msg);
      showToast("error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  return (
    <div className="auth-page-container">
      <div className="auth-page-backdrop" />
      <div className="auth-page-content centered">
        {/* Auth Form Card */}
        <div className="auth-form-side">
          <div className="modal-card auth-page-card">
            <div className="auth-header">
              <div className="auth-logo-badge">
                <Film size={28} />
              </div>
              <h2>{isRegister ? "Criar sua Conta" : "Entrar no CineHanks"}</h2>
              <p className="auth-subtitle">
                {isRegister
                  ? "Preencha seus dados para se cadastrar"
                  : "Informe suas credenciais para continuar"}
              </p>
            </div>

            {/* Tab Selector */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${!isRegister ? "active" : ""}`}
                onClick={toggleMode}
              >
                <LogIn size={16} />
                <span>Entrar</span>
              </button>
              <button
                type="button"
                className={`auth-tab ${isRegister ? "active" : ""}`}
                onClick={toggleMode}
              >
                <UserPlus size={16} />
                <span>Cadastrar</span>
              </button>
            </div>

            {error && <div className="auth-error-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegister && (
                <div className="input-group">
                  <label>Nome Completo</label>
                  <div className="input-wrapper">
                    <UserIcon className="input-icon" size={18} />
                    <input
                      type="text"
                      placeholder="Ex: Guilherme Santos"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label>Endereço de E-mail</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <span className="btn-spinner"></span>
                ) : isRegister ? (
                  "Finalizar Cadastro"
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
