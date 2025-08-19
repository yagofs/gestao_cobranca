import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { Building2, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import axios from 'axios';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });
  localStorage.setItem('access_token', response.data.access_token);
  localStorage.setItem('username', username);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.msg || 'Erro ao fazer login');
      console.error('Erro de login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-6">
          <Logo size="lg" className="justify-center" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Sistema de Cobrança</h1>
            <p className="text-muted-foreground">
              Faça login para acessar o sistema
            </p>
          </div>
        </div>

        <Card className="p-8 bg-card border-0 shadow-elegant">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-muted-foreground">Usuário</label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Digite seu usuário" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">Senha</label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Digite sua senha" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="h-11"
                />
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-gradient-primary hover:bg-primary-hover border-0 text-white font-medium shadow-elegant"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Login</span>
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/register")}
              className="w-full h-12"
            >
              Cadastro de Usuário
            </Button>
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Versão 1.0 • © 2025
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;