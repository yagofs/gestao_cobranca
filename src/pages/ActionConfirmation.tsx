import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  FileText, 
  Calendar, 
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from 'axios';

const ActionConfirmation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    action, 
    comment, 
    contractNumber, 
    selectedInstallmentNumber, 
    selectedInstallmentDueDate,
    clientName, 
    clientCpf,  
    contractType, 
    installmentValue, 
    contractDaysOverdue, 
    contractFineValue 
  } = location.state || {};

  const handleBack = () => {
    navigate("/contracts", { state: { clientName, clientCpf } }); // Voltar para Contracts com os dados do cliente
  };

  const handleConfirm = async () => {
    console.log("handleConfirm: Função iniciada");
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token'); 
    if (!token) {
      toast.error("Erro de autenticação: Token não encontrado.");
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    try {
      const contractsResponse = await axios.get(`http://localhost:5000/api/contracts?cpf=${clientCpf}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const contract = contractsResponse.data.find((c: any) => c.number === contractNumber);

      if (!contract) {
        toast.error("Contrato não encontrado.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        clientCpf,
        contractNumber: contract.number, 
        selectedInstallmentNumber, 
        actionType: action,
        notes: comment,
        status: "Concluída",
        contractId: contract.id, 
        installmentNumber: selectedInstallmentNumber 
      };

      console.log("handleConfirm: Enviando payload", payload);
      await axios.post('http://localhost:5000/api/actions', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success("Ação registrada com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.msg || "Erro ao registrar ação.");
      console.error("Erro ao registrar ação:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clientData = {
    name: clientName || "",
    cpf: clientCpf || "",
    phones: [] 
  };

  const contractData = {
    number: contractNumber || "",
    type: contractType || "",
    installmentNumber: selectedInstallmentNumber || 0,
    installmentValue: installmentValue || 0,
    dueDate: selectedInstallmentDueDate || "",
    daysOverdue: contractDaysOverdue || 0,
    fineValue: contractFineValue || 0
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
    } catch (e) {
      return '-';
    }
  };

  const currentDateTime = new Date().toLocaleString('pt-BR');

  const currentOperator = localStorage.getItem("username") || "Operador Desconhecido"; 

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!action || !comment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Dados não encontrados</h2>
          <p className="text-muted-foreground mb-4">
            Não foi possível recuperar os dados da ação.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <Button variant="outline" onClick={handleBack} className="gap-2" disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4" />
              Voltar para Editar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <Card className="p-6 bg-gradient-subtle border-0 shadow-card">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Confirmação de Registro</h1>
            <p className="text-muted-foreground">
              Revise os dados antes de confirmar o registro da ação
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Dados do Cooperado</h2>
            
            <Card className="p-6 bg-card border-border shadow-card">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{clientData.name}</p>
                    <p className="text-sm text-muted-foreground">Nome Completo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{clientData.cpf}</p>
                    <p className="text-sm text-muted-foreground">CPF</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {clientData.phones.map((phone, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/50 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{phone}</p>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 ? 'Telefone Principal' : 'Telefone Secundário'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <h3 className="text-lg font-semibold">Contrato/Parcela</h3>
            
            <Card className="p-6 bg-card border-border shadow-card">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-lg">Contrato {contractData.number}</p>
                    <p className="text-muted-foreground">{contractData.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(contractData.installmentValue)}
                    </p>
                    <p className="text-sm text-muted-foreground">Valor da parcela</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Número da Parcela</p>
                    <p className="font-medium">{contractData.installmentNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Vencimento</p>
                    <p className="font-medium">{formatDate(contractData.dueDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Dias em Atraso</p>
                    <p className="font-medium">{contractData.daysOverdue} dias</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Ação Registrada</h2>
            
            <Card className="p-6 bg-gradient-primary border-0 shadow-elegant text-white">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{action}</p>
                    <p className="text-white/80 text-sm">Tipo de Ação</p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white/80 text-sm mb-2">Comentários:</p>
                  <p className="text-white text-sm leading-relaxed">{comment}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div className="space-y-1">
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Data/Hora
                    </p>
                    <p className="text-white font-medium text-sm">{currentDateTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Operador
                    </p>
                    <p className="text-white font-medium text-sm">{currentOperator}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/30 border-border">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Atenção
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Esta ação será registrada no sistema de forma permanente</li>
                  <li>• O histórico ficará disponível para consulta futura</li>
                  <li>• Certifique-se de que todos os dados estão corretos</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Editar
          </Button>
          <Button 
            onClick={() => { 
              console.log("Botão Confirmar Registro clicado!");
              handleConfirm(); 
            }}
            disabled={isSubmitting}
            className="bg-gradient-primary hover:bg-primary-hover gap-2 min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Registro
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionConfirmation;