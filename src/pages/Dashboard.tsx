import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { MetricCard } from "@/components/ui/metric-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  DollarSign, 
  AlertTriangle, 
  Activity,
  User,
  LogOut,
    Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from 'axios'; 

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [overdueInstallments, setOverdueInstallments] = useState<any[]>([]);
  const [uniqueClients, setUniqueClients] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const [totalOverdueValue, setTotalOverdueValue] = useState<number>(0);
  const [totalOverdueInstallments, setTotalOverdueInstallments] = useState<number>(0);
  const [todayActionsCount, setTodayActionsCount] = useState<number>(0);

  useEffect(() => {
  const fetchDashboardData = async () => {
      setLoading(true);
  try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          toast.error("Erro de autenticação: Token não encontrado.");
          navigate("/login");
          return;
        }

        const installmentsResponse = await axios.get('http://localhost:5000/api/overdue_installments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOverdueInstallments(installmentsResponse.data);

        const recentActionsResponse = await axios.get('http://localhost:5000/api/actions/recent', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentActions(recentActionsResponse.data);

        const totalValue = installmentsResponse.data.reduce((sum: number, inst: any) => sum + inst.amount, 0);
        setTotalOverdueValue(totalValue);
        setTotalOverdueInstallments(installmentsResponse.data.length);

        const todayActionsResponse = await axios.get('http://localhost:5000/api/actions/today_count', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTodayActionsCount(todayActionsResponse.data.count);
        
        const clientsMap = new Map<string, { name: string; cpf: string; contracts: Set<string>; parcels: number }>();
        installmentsResponse.data.forEach((row: any) => {
          const current = clientsMap.get(row.cpf) ?? { name: row.clientName, cpf: row.cpf, contracts: new Set<string>(), parcels: 0 };
          current.contracts.add(row.contractNumber);
          current.parcels += 1;
          clientsMap.set(row.cpf, current);
        });
        setUniqueClients(Array.from(clientsMap.values()).map(v => ({ 
          name: v.name, 
          cpf: v.cpf, 
          contractsCount: v.contracts.size, 
          parcelsCount: v.parcels 
        })));

      } catch (err: any) {
        setError(err.response?.data?.msg || "Erro ao carregar dados do dashboard.");
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token'); 
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const handleProceed = () => {
    if (!selectedClient) {
      toast.error("Selecione um cooperado para prosseguir");
      return;
    }
    const parts = selectedClient.split(" - ");
    const clientName = parts[0] ?? "";
    const clientCpf = parts[1] ?? "";
    navigate("/contracts", { state: { clientName, clientCpf } });
  };

  const metrics = [
    {
      title: "Total Inadimplente",
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOverdueValue),
      icon: DollarSign,
    },
    {
      title: "Fichas em Inadimplência",
      value: totalOverdueInstallments.toString(),
      icon: AlertTriangle,
    },
    {
      title: "Ações de Cobrança Hoje",
      value: todayActionsCount.toString(),
      icon: Activity,
    }
  ];

  interface OverdueInstallmentRow {
    id: string;
    clientName: string;
    cpf: string;
    contractNumber: string;
    installmentNumber: number;
    dueDate: string; // ISO date string
    daysOverdue: number;
    amount: number;
  }

  const sortedInstallments = [...overdueInstallments].sort(
    (a, b) => a.daysOverdue - b.daysOverdue
  );

  const filteredInstallments = sortedInstallments;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Carregando dados do dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar dados: {error}</p>
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{username ? `${username} - operador` : "Desconhecido - operador"}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Página Inicial</h1>
          <p className="text-muted-foreground">
            Gerencie as ações de cobrança da cooperativa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Parcelas Inadimplentes</h2>
            <div className="flex items-center gap-4">
            </div>
          </div>
          <Card className="p-0 bg-card border-border shadow-card">
            <Table
              className="min-w-[1400px] whitespace-nowrap"
              containerClassName="max-h-80 overflow-y-scroll overflow-x-auto"
            >
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10 bg-card">Cooperado</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">CPF</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Contrato</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Parcela</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Vencimento</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Valor</TableHead>
                  <TableHead className="sticky top-0 z-10 bg-card">Dias em atraso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstallments.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.clientName}</TableCell>
                    <TableCell>{row.cpf}</TableCell>
                    <TableCell>{row.contractNumber}</TableCell>
                    <TableCell>{row.installmentNumber}</TableCell>
                    <TableCell>{new Date(row.dueDate).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.amount)}</TableCell>
                    {/* Removido dado Status Régua */}
                    {/* Removed Area Responsável data */}
                    <TableCell>{row.daysOverdue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        

        {/* Client Selector Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Search */}
          <Card className="p-6 bg-gradient-subtle border-0 shadow-card">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Buscar Cooperado</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="client-search" className="text-sm font-medium text-muted-foreground">
                    Nome ou CPF do Cooperado
                  </label>
                  <Input
                    id="client-search"
                    name="client-search"
                    placeholder="Digite o nome ou CPF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11"
                  />
                </div>

                {searchQuery && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Resultados da Busca
                    </p>
                    <div className="space-y-2">
                      {uniqueClients
                        .filter(client => 
                          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.cpf.includes(searchQuery)
                        )
                        .map((client) => (
                          <button
                            type="button"
                            key={client.cpf}
                            className={`w-full text-left p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedClient === `${client.name} - ${client.cpf}` 
                                ? "bg-accent border-primary" 
                                : "bg-background hover:bg-muted/50"
                            }`}
                            aria-pressed={selectedClient === `${client.name} - ${client.cpf}`}
                            title={`Selecionar ${client.name} (${client.cpf})`}
                            onClick={() => setSelectedClient(`${client.name} - ${client.cpf}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{client.name}</p>
                                <p className="text-xs text-muted-foreground">{client.cpf}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">{client.contractsCount} contrato(s)</p>
                                <p className="text-xs text-muted-foreground">{client.parcelsCount} parcela(s) em atraso</p>
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleProceed}
                  disabled={!selectedClient}
                  className="w-full bg-gradient-primary hover:bg-primary-hover"
                >
                  Prosseguir para Contratos
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-subtle border-0 shadow-card">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold">Atividade Recente</h2>
              </div>
              
              <div className="space-y-3">
                {recentActions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma atividade recente encontrada.</p>
                ) : (
                  recentActions.map((activity: any, index: number) => {
                    let dotColorClass = 'bg-primary';
                    if (activity.type === 'success') {
                      dotColorClass = 'bg-green-500';
                    } else if (activity.type === 'info') {
                      dotColorClass = 'bg-blue-500';
                    }
                    return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${dotColorClass}`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.actionType}</p>
                          <span className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{activity.clientName}</p>
                      </div>
                    </div>
                    );
                  })
                )}
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/reports")}
              >
                Ver Relatórios
              </Button>
            </div>
          </Card>
        </div>

        
      </div>
    </div>
  );
};

export default Dashboard;