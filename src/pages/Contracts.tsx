import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/ui/logo";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  FileText, 
  Calendar, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Installment {
  number: number;
  dueDate: string;
  daysOverdue: number;
  amount: number;
}

interface Contract {
  id: string;
  number: string;
  clientCpf: string;
  type: string;
  installmentValue: number;
  dueDate: string;
  daysOverdue: number;
  fineValue: number;
  status: string;
  installments: Installment[];
  updatedValue: number;
}

const Contracts = () => {
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedClientFromNav = (location.state as { clientName?: string; clientCpf?: string } | undefined) ?? {};

  const [clientInfo, setClientInfo] = useState({
    name: selectedClientFromNav.clientName ?? "",
    cpf: selectedClientFromNav.clientCpf ?? "",
    phones: [] as string[]
  });

  useEffect(() => {
    const fetchClientAndContracts = async () => {
      if (!selectedClientFromNav.clientCpf) {
        setError("CPF do cliente não fornecido na navegação.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate("/login");
          toast.error("Você precisa estar logado para acessar esta página.");
          return;
        }

        const clientResponse = await fetch(`http://127.0.0.1:5000/api/client_by_cpf?cpf=${selectedClientFromNav.clientCpf}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!clientResponse.ok) {
          const errorData = await clientResponse.json();
          throw new Error(errorData.msg || "Erro ao buscar detalhes do cliente.");
        }
        const clientData = await clientResponse.json();
        setClientInfo({
          name: clientData.name,
          cpf: clientData.cpf,
          phones: clientData.phones
        });

        // Fetch contracts
        const contractsResponse = await fetch(`http://127.0.0.1:5000/api/contracts?cpf=${selectedClientFromNav.clientCpf}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!contractsResponse.ok) {
          const errorData = await contractsResponse.json();
          throw new Error(errorData.msg || "Erro ao buscar contratos.");
        }
        const contractsData = await contractsResponse.json();
        setContracts(contractsData);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar dados.");
        toast.error("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientAndContracts();
  }, [selectedClientFromNav.clientCpf, navigate]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleRegisterAction = async () => {
    if (!selectedContractId) {
      toast.error("Selecione um contrato para registrar a ação");
      return;
    }
    if (selectedInstallment === null) {
      toast.error("Selecione a parcela do contrato");
      return;
    }

    const contract = contracts.find(c => c.id === selectedContractId);
    const inst = contract?.installments.find(i => i.number === selectedInstallment);

    if (!contract || !inst) {
      toast.error("Contrato ou parcela selecionada inválida.");
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate("/login");
        toast.error("Você precisa estar logado para registrar uma ação.");
        return;
      }

      toast.success(`Contrato selecionado e parcela ${selectedInstallment} definida para ação.`);
      navigate("/action-history", {
        state: {
          contractNumber: contract?.number,
          selectedInstallmentNumber: inst?.number,
          selectedInstallmentDueDate: inst?.dueDate,
          clientName: clientInfo.name, 
          clientCpf: clientInfo.cpf,   
          contractType: contract.type, 
          installmentValue: inst.amount,
          contractDaysOverdue: contract.daysOverdue, 
          contractFineValue: contract.fineValue, 
          contractId: contract.id,
          installmentNumber: inst.number 
        }
      });
    } catch (err) {
      console.error("Erro ao registrar ação:", err);
      toast.error(err instanceof Error ? err.message : "Erro desconhecido ao registrar ação.");
    }
  };

  const handleContractSelect = (checked: boolean | string, contractId: string, daysOverdue: number) => {
    setSelectedInstallment(null);
    if (checked) {
      setSelectedContractId(contractId);
      const contract = contracts.find(c => c.id === contractId);
      if (contract && contract.installments.length === 1) {
        setSelectedInstallment(contract.installments[0].number);
      }
    } else {
      setSelectedContractId("");
    }
  };

  const delinquentContracts = useMemo(
    () => contracts.filter(
      c => c.clientCpf === clientInfo.cpf && c.installments?.some(i => i.daysOverdue > 0)
    ),
    [contracts, clientInfo.cpf]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue': return AlertCircle;
      case 'recent': return Calendar;
      default: return CheckCircle2;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando contratos...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-destructive">Erro: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Client Info Header */}
        <Card className="p-6 bg-gradient-subtle border-0 shadow-card">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Contratos e Parcelas</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{clientInfo.name}</p>
                  <p className="text-sm text-muted-foreground">Cooperado</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{clientInfo.cpf}</p>
                  <p className="text-sm text-muted-foreground">CPF</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/50 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{clientInfo.phones[0]}</p>
                  <p className="text-sm text-muted-foreground">Principal</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contracts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contratos Inadimplentes</h2>
            <div className="text-sm text-muted-foreground">
              {selectedContractId ? 1 : 0} de {delinquentContracts.length} selecionado(s)
            </div>
          </div>

          <div className="space-y-4">
            {delinquentContracts.length === 0 && !loading && !error ? (
              <p className="text-center text-muted-foreground">Nenhum contrato inadimplente encontrado para este CPF.</p>
            ) : (
              delinquentContracts.map((contract) => {
                const StatusIcon = getStatusIcon(contract.status);
                const isSelected = selectedContractId === contract.id;
                const totalAmount = contract.installments.reduce((sum, i) => sum + i.amount, 0);
                const earliestOverdueInstallment = contract.installments
                  .filter(i => i.daysOverdue > 0)
                  .reduce((earliest, curr) => {
                    if (!earliest) return curr;
                    return new Date(curr.dueDate) < new Date(earliest.dueDate) ? curr : earliest;
                  }, undefined as undefined | Installment);
                
                return (
                  <Card key={contract.id} className={`p-6 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-accent/30 border-primary shadow-elegant' 
                      : 'bg-card hover:bg-muted/30 border-border shadow-card'
                  }`}>
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleContractSelect(checked, contract.id, contract.daysOverdue)}
                        className="mt-1"
                        disabled={!!selectedContractId && !isSelected}
                      />
                      
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">Contrato {contract.number}</h3>
                            <div className="flex items-center gap-1">
                                <StatusIcon className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                  {contract.daysOverdue} dias em atraso
                                </span>
                              </div>
                            </div>
                            <p className="text-muted-foreground">{contract.type}</p>
                          </div>
                          
                          <div className="flex items-start gap-6">
                            <div className="text-left">
                              <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                              <p className="text-lg font-bold text-foreground">
                                {earliestOverdueInstallment 
                                  ? new Date(earliestOverdueInstallment.dueDate).toLocaleDateString('pt-BR') 
                                  : '-'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Valor do Contrato</p>
                            <p className="text-lg font-bold text-foreground">
                                {formatCurrency(totalAmount)}
                            </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Valor Atualizado</p>
                              <p className="text-lg font-bold text-foreground">
                                {formatCurrency(contract.updatedValue)}
                              </p>
                            </div>
                          </div>
                        </div>
                      
                        {isSelected && (
                          <div className="pt-4 border-t border-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Selecione a parcela</p>
                                {(() => {
                                  const overdue = contract.installments.filter(i => i.daysOverdue > 0);
                                  return (
                                    <Select
                                      value={selectedInstallment?.toString() ?? undefined}
                                      onValueChange={(v) => setSelectedInstallment(Number(v))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Escolha a parcela em atraso" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {overdue.map((i) => (
                                          <SelectItem key={i.number} value={i.number.toString()}>
                                            Parcela {i.number} • Venc. {new Date(i.dueDate).toLocaleDateString('pt-BR')} • {`${i.daysOverdue}d em atraso`}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  );
                                })()}
                              </div>
                              {selectedInstallment !== null && (
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">Detalhes da parcela</p>
                                  {(() => {
                                    const inst = contract.installments.find(i => i.number === selectedInstallment && i.daysOverdue > 0);
                                    if (!inst) return null;
                                    return (
                                      <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <p className="text-muted-foreground">Vencimento</p>
                                          <p className="font-medium">{new Date(inst.dueDate).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Situação</p>
                                          <p className="font-medium">{inst.daysOverdue > 0 ? `${inst.daysOverdue} dias em atraso` : 'Em dia'}</p>
                                        </div>
                                        <div>
                                          <p className="text-muted-foreground">Valor</p>
                                          <p className="font-medium">{formatCurrency(inst.amount)}</p>
                                        </div>
                                      </div>
                                    );
                                  })()}
                          </div>
                              )}
                          </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              }))}
          </div>
        </div>

        {/* Action Button */}
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
            onClick={handleRegisterAction}
            disabled={!selectedContractId || selectedInstallment === null}
            className="bg-gradient-primary hover:bg-primary-hover gap-2"
          >
            <FileText className="w-4 h-4" />
            Registrar Ação {selectedContractId ? 1 : 0} selecionado(s)
          </Button>
        </div>

        
      </div>
    </div>
  );
};

export default Contracts;