import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres!");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/register", {
        username: formData.username,
        password: formData.password,
      });
      toast.success(response.data.msg || "Usuário cadastrado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Erro ao cadastrar usuário");
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
            <h1 className="text-3xl font-bold text-foreground">Cadastro de Usuário</h1>
            <p className="text-muted-foreground">
              Preencha os dados para criar sua conta no sistema
            </p>
          </div>
        </div>

        <Card className="p-8 bg-card border-0 shadow-elegant">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nome de usuário</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Digite seu nome de usuário"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-primary hover:bg-primary-hover border-0 text-white font-medium shadow-elegant"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Cadastrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    <span>Cadastrar Usuário</span>
                  </div>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Login
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Ao criar uma conta, você concorda com os termos de uso
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;