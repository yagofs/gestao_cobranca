import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  AlertCircle
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from 'react'; 
import axios from 'axios'; 

const ActionHistory = () => {
  const [selectedAction, setSelectedAction] = useState("");
  const [comment, setComment] = useState("");
  const [actions, setActions] = useState<any[]>([]); 
  const [clientData, setClientData] = useState<any>(null); 
  const [contractData, setContractData] = useState<any>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    contractNumber: paramContractNumber, 
    selectedInstallmentNumber: paramSelectedInstallmentNumber, 
    selectedInstallmentDueDate: paramSelectedInstallmentDueDate, 
    clientName: paramClientName, 
    clientCpf: paramClientCpf,
    contractType: paramContractType,
    installmentValue: paramInstallmentValue,
    contractDaysOverdue: paramContractDaysOverdue,
    contractFineValue: paramContractFineValue,
    contractId: paramContractId,
    installmentNumber: paramInstallmentNumber 
  } = location.state || {};

  useEffect(() => {
    const fetchClientAndActions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error("Erro de autenticação: Token não encontrado.");
          navigate("/login");
          return;
        }

        // 1. Buscar dados do cliente pelo CPF
        const clientResponse = await axios.get(`http://localhost:5000/api/client_by_cpf?cpf=${paramClientCpf}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!clientResponse.data) {
          setError("Cliente não encontrado.");
          setLoading(false);
          return;
        }
        const fetchedClient = clientResponse.data;
        setClientData(fetchedClient);

        // 2. Buscar contratos do cliente para encontrar o contrato selecionado e seus detalhes
        const contractsResponse = await axios.get(`http://localhost:5000/api/contracts?cpf=${fetchedClient.cpf}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fetchedContract = contractsResponse.data.find(
          (c: any) => c.number === paramContractNumber
        );
        if (fetchedContract) {
          setContractData({
            number: fetchedContract.number,
            type: fetchedContract.type,
            installmentValue: fetchedContract.installmentValue,
            dueDate: fetchedContract.dueDate,
            daysOverdue: fetchedContract.daysOverdue,
            fineValue: fetchedContract.fineValue
          });
        }

        // 3. Buscar histórico de ações para este cliente, filtrando por contrato e parcela
        let actionsUrl = `http://localhost:5000/api/actions/${fetchedClient.id}`;
        const queryParams = [];
        if (paramContractId) {
          queryParams.push(`contract_id=${paramContractId}`);
        }
        if (paramSelectedInstallmentNumber) {
          queryParams.push(`installment_number=${paramSelectedInstallmentNumber}`);
        }
        if (queryParams.length > 0) {
          actionsUrl += `?${queryParams.join('&')}`;
        }
        const actionsResponse = await axios.get(actionsUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActions(actionsResponse.data);

      } catch (err: any) {
        setError(err.response?.data?.msg || "Erro ao carregar dados.");
        console.error("Erro ao carregar dados em ActionHistory:", err);
      } finally {
        setLoading(false);
      }
    };

    if (paramClientCpf) {
      fetchClientAndActions();
    } else {
      setError("CPF do cliente não fornecido.");
      setLoading(false);
    }
  }, [paramClientCpf, navigate, paramContractNumber, paramContractId, paramSelectedInstallmentNumber]); 

  const handleBack = () => {
    navigate("/contracts", { state: { clientName: paramClientName, clientCpf: paramClientCpf }});
  };

  const handleContinue = () => {
    if (!selectedAction) {
      toast.error("Selecione uma ação para continuar");
      return;
    }
    if (!comment.trim()) {
      toast.error("Adicione um comentário obrigatório");
      return;
    }
    
    navigate("/action-confirmation", { 
      state: { 
        action: selectedAction, 
        comment: comment.trim(),
        contractNumber: paramContractNumber,
        selectedInstallmentNumber: paramSelectedInstallmentNumber,
        selectedInstallmentDueDate: paramSelectedInstallmentDueDate,
        clientName: paramClientName,
        clientCpf: paramClientCpf,
        contractType: contractData?.type, 
        installmentValue: paramInstallmentValue, 
        contractDaysOverdue: contractData?.daysOverdue, 
        contractFineValue: contractData?.fineValue 
      } 
    });
  };

  const predefinedActions = [
    "Tentativa de contato por telefone",
    "Envio de notificação por SMS/WhatsApp", 
    "Carta de cobrança enviada",
    "Negociação realizada",
    "Promessa de pagamento",
    "Contato com avalista",
    "Visita ao cooperado",
    "Encaminhamento jurídico"
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Contratos
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Client and Contract Info Header */}
        <Card className="p-6 bg-gradient-subtle border-0 shadow-card">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Histórico e Registro de Ação</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{clientData?.name || "Carregando..."}</p>
                  <p className="text-sm text-muted-foreground">Cooperado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Contrato {contractData?.number || "Carregando..."}</p>
                  <p className="text-sm text-muted-foreground">{contractData?.type || "Carregando..."}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/50 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{clientData?.phones?.[0] || "Carregando..."}</p>
                  <p className="text-sm text-muted-foreground">Principal</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted/30 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-medium text-foreground">{formatCurrency(contractData?.installmentValue + contractData?.fineValue)}</p>
                    <p className="text-sm text-muted-foreground">{contractData?.daysOverdue || 0} dias em atraso</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Historical Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Histórico de Ações
            </h2>
            
            <div className="space-y-4">
              {loading ? (
                <p>Carregando histórico de ações...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : actions.length === 0 ? (
                <p>Nenhum histórico de ações encontrado para este cliente.</p>
              ) : (
                actions.map((item) => (
                  <Card key={item.id} className="p-4 bg-card border-border shadow-card">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{item.actionType}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {item.contractNumber && item.installmentNumber && (
                            <p className="text-xs text-muted-foreground">
                              Contrato: {item.contractNumber} • Parcela: {item.installmentNumber}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground mb-1">Operador: {item.operator || "Operador Desconhecido"}</p>
                        <p className="text-sm text-foreground">{item.notes}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* New Action Form */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-secondary" />
              Nova Ação
            </h2>

            <Card className="p-6 bg-card border-border shadow-card">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="action">Tipo de Ação *</Label>
                  <Select value={selectedAction} onValueChange={setSelectedAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a ação realizada" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedActions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Comentários *</Label>
                  <Textarea
                    id="comment"
                    placeholder="Descreva detalhadamente a ação realizada..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {comment.length}/500 caracteres
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Data/Hora: {new Date().toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Operador: {localStorage.getItem("username") || "Operador Desconhecido"}
                      </span>
                    </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedAction || !comment.trim()}
            className="bg-gradient-primary hover:bg-primary-hover gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionHistory;