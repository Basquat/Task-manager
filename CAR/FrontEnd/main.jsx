import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx'
import {
  Car,
  Bike,
  Search,
  Plus,
  Moon,
  Sun,
  Check,
  X,
  DollarSign,
  Trash2,
  Edit,
  Star,
  Trash,
  AlertTriangle,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  // Estados principais
  const [darkMode, setDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('carros')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [notifications, setNotifications] = useState([])
  
  // Estados dos veículos
  const [carros, setCarros] = useState([
    {
      id: 1,
      placa: 'ABC-1234',
      modelo: 'Honda Civic',
      cor: 'Preto',
      pago: true,
      valor: 15.00,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
    },
    {
      id: 2,
      placa: 'XYZ-5678',
      modelo: 'Toyota Corolla',
      cor: 'Branco',
      pago: false,
      valor: 0,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 horas atrás
    }
  ])
  
  const [motos, setMotos] = useState([
    {
      id: 1,
      placa: 'MOT-1111',
      modelo: 'Honda CB 600',
      cor: 'Azul',
      pago: true,
      valor: 8.00,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hora atrás
    },
    {
      id: 2,
      placa: 'MOT-2222',
      modelo: 'Yamaha YBR',
      cor: 'Vermelha',
      pago: false,
      valor: 0,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 horas atrás
    }
  ])

  // Estado do formulário
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    cor: '',
  })

  // Aplicar tema escuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      showNotification('Conexão restaurada', 'success')
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      showNotification('Modo offline ativado', 'warning')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Verificar veículos pendentes há muito tempo
  useEffect(() => {
    const checkPendingVehicles = () => {
      const now = new Date()
      const threshold = 2 * 60 * 60 * 1000 // 2 horas em millisegundos
      
      const allVehicles = [...carros, ...motos]
      const pendingTooLong = allVehicles.filter(vehicle => 
        !vehicle.pago && (now - vehicle.createdAt) > threshold
      )
      
      pendingTooLong.forEach(vehicle => {
        const timeElapsed = Math.floor((now - vehicle.createdAt) / (60 * 60 * 1000))
        showNotification(
          `Veículo ${vehicle.placa} está pendente há ${timeElapsed}h`,
          'warning'
        )
      })
    }

    const interval = setInterval(checkPendingVehicles, 30 * 60 * 1000) // Verificar a cada 30 minutos
    checkPendingVehicles() // Verificar imediatamente

    return () => clearInterval(interval)
  }, [carros, motos])

  // Salvar dados no localStorage (modo offline)
  useEffect(() => {
    localStorage.setItem('estacionamento_carros', JSON.stringify(carros))
  }, [carros])

  useEffect(() => {
    localStorage.setItem('estacionamento_motos', JSON.stringify(motos))
  }, [motos])

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedCarros = localStorage.getItem('estacionamento_carros')
    const savedMotos = localStorage.getItem('estacionamento_motos')
    
    if (savedCarros) {
      const parsedCarros = JSON.parse(savedCarros).map(carro => ({
        ...carro,
        createdAt: new Date(carro.createdAt)
      }))
      setCarros(parsedCarros)
    }
    
    if (savedMotos) {
      const parsedMotos = JSON.parse(savedMotos).map(moto => ({
        ...moto,
        createdAt: new Date(moto.createdAt)
      }))
      setMotos(parsedMotos)
    }
  }, [])

  // Sistema de notificações
  const showNotification = (message, type = 'info') => {
    const id = Date.now()
    const notification = { id, message, type }
    setNotifications(prev => [...prev, notification])
    
    // Remover notificação após 5 segundos
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  // Filtrar veículos por pesquisa
  const filtrarVeiculos = (veiculos) => {
    return veiculos.filter(veiculo => 
      veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Calcular totais
  const totalCarros = carros.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0)
  const totalMotos = motos.filter(m => m.pago).reduce((sum, m) => sum + m.valor, 0)
  const totalGeral = totalCarros + totalMotos
  const totalVeiculos = carros.length + motos.length
  const veiculosPagos = carros.filter(c => c.pago).length + motos.filter(m => m.pago).length

  // Marcar como pago/não pago
  const togglePagamento = async (id, tipo) => {
    setIsLoading(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (tipo === 'carro') {
      setCarros(carros.map(c => 
        c.id === id 
          ? { ...c, pago: !c.pago, valor: !c.pago ? 15.00 : 0 }
          : c
      ))
    } else {
      setMotos(motos.map(m => 
        m.id === id 
          ? { ...m, pago: !m.pago, valor: !m.pago ? 8.00 : 0 }
          : m
      ))
    }
    
    setIsLoading(false)
    showNotification('Status de pagamento atualizado', 'success')
  }

  // Adicionar veículo
  const adicionarVeiculo = async () => {
    if (!formData.placa || !formData.modelo) return

    setIsLoading(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800))

    const novoVeiculo = {
      id: Date.now(),
      ...formData,
      pago: false,
      valor: 0,
      createdAt: new Date()
    }

    if (activeTab === 'carros') {
      setCarros([...carros, novoVeiculo])
    } else {
      setMotos([...motos, novoVeiculo])
    }

    setFormData({ placa: '', modelo: '', cor: '' })
    setShowAddForm(false)
    setIsLoading(false)
    showNotification('Veículo adicionado com sucesso', 'success')
  }

  // Remover veículo
  const removerVeiculo = async (id, tipo) => {
    setIsLoading(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (tipo === 'carro') {
      setCarros(carros.filter(c => c.id !== id))
    } else {
      setMotos(motos.filter(m => m.id !== id))
    }
    
    setIsLoading(false)
    showNotification('Veículo removido', 'info')
  }

  // Limpar todos os veículos
  const limparTodosVeiculos = async () => {
    setIsLoading(true)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setCarros([])
    setMotos([])
    setIsLoading(false)
    showNotification('Todos os veículos foram removidos', 'success')
  }

  // Animações de container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground transition-all duration-500">
      {/* Notificações */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-lg shadow-lg backdrop-blur-sm border flex items-center gap-2 ${
                notification.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300' :
                notification.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300' :
                'bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm">{notification.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-card/80 backdrop-blur-md border-b border-border/50 p-4 shadow-lg sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg"
            >
              <Car className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Estacionamento Fonte Nova
              </h1>
              <p className="text-sm text-muted-foreground">Sistema inteligente de controle</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            {/* Indicador de conexão */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-2 rounded-lg ${isOnline ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}
            >
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="relative overflow-hidden transition-all hover:shadow-lg"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: darkMode ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Resumo Financeiro */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium">Total Carros</p>
                    <motion.p 
                      className="text-3xl font-bold"
                      key={totalCarros}
                      initial={{ scale: 1.2, color: "#fbbf24" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      R$ {totalCarros.toFixed(2)}
                    </motion.p>
                    <p className="text-emerald-200 text-xs">{carros.filter(c => c.pago).length} pagos</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="p-3 bg-white/20 rounded-full"
                  >
                    <Car className="h-8 w-8 text-emerald-100" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-teal-100 text-sm font-medium">Total Motos</p>
                    <motion.p 
                      className="text-3xl font-bold"
                      key={totalMotos}
                      initial={{ scale: 1.2, color: "#fbbf24" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      R$ {totalMotos.toFixed(2)}
                    </motion.p>
                    <p className="text-teal-200 text-xs">{motos.filter(m => m.pago).length} pagos</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    className="p-3 bg-white/20 rounded-full"
                  >
                    <Bike className="h-8 w-8 text-teal-100" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">Total Geral</p>
                    <motion.p 
                      className="text-3xl font-bold"
                      key={totalGeral}
                      initial={{ scale: 1.2, color: "#fbbf24" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      R$ {totalGeral.toFixed(2)}
                    </motion.p>
                    <p className="text-indigo-200 text-xs">Receita total</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="p-3 bg-white/20 rounded-full"
                  >
                    <DollarSign className="h-8 w-8 text-indigo-100" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Veículos</p>
                    <motion.p 
                      className="text-3xl font-bold"
                      key={totalVeiculos}
                      initial={{ scale: 1.2, color: "#fbbf24" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                    >
                      {totalVeiculos}
                    </motion.p>
                    <p className="text-amber-200 text-xs">{veiculosPagos} pagos</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-3 bg-white/20 rounded-full flex gap-1"
                  >
                    <Car className="h-6 w-6 text-amber-100" />
                    <Bike className="h-6 w-6 text-amber-100" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Barra de Pesquisa */}
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            <Input
              placeholder="Pesquisar por placa ou modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Tabs de Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div 
            className="flex items-center justify-between mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-card/50 backdrop-blur-sm">
              <TabsTrigger value="carros" className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                <Car className="h-4 w-4" />
                Carros ({carros.length})
              </TabsTrigger>
              <TabsTrigger value="motos" className="flex items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <Bike className="h-4 w-4" />
                Motos ({motos.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    animate={{ rotate: showAddForm ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.div>
                  Adicionar {activeTab === 'carros' ? 'Carro' : 'Moto'}
                </Button>
              </motion.div>

              {/* Botão de limpar todos */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="destructive"
                      className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={totalVeiculos === 0}
                    >
                      <Trash className="h-4 w-4" />
                      Limpar Tudo
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Confirmar exclusão
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover <strong>TODOS</strong> os veículos (carros e motos) do sistema.
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Continuar</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Última confirmação
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza absoluta? Todos os {totalVeiculos} veículos serão removidos permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={limparTodosVeiculos} className="bg-destructive hover:bg-destructive/90">
                            Sim, remover tudo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>

          {/* Formulário de Adicionar */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -20 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
                    <CardTitle className="flex items-center gap-2">
                      {activeTab === 'carros' ? <Car className="h-5 w-5" /> : <Bike className="h-5 w-5" />}
                      Adicionar {activeTab === 'carros' ? 'Carro' : 'Moto'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <motion.div variants={itemVariants}>
                        <Input
                          placeholder="Placa (ABC-1234)"
                          value={formData.placa}
                          onChange={(e) => setFormData({...formData, placa: e.target.value})}
                          className="h-12"
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Input
                          placeholder="Modelo"
                          value={formData.modelo}
                          onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                          className="h-12"
                        />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <Input
                          placeholder="Cor"
                          value={formData.cor}
                          onChange={(e) => setFormData({...formData, cor: e.target.value})}
                          className="h-12"
                        />
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="flex gap-3 mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button 
                        onClick={adicionarVeiculo}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Adicionar
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddForm(false)}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lista de Carros */}
          <TabsContent value="carros">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filtrarVeiculos(carros).map((carro, index) => (
                  <motion.div
                    key={carro.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ scale: 0, opacity: 0, rotateX: 90 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Car className="h-5 w-5 text-emerald-500" />
                            </motion.div>
                            {carro.placa}
                          </CardTitle>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Badge 
                              variant={carro.pago ? "default" : "destructive"}
                              className={carro.pago ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                            >
                              {carro.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </motion.div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm"><strong>Modelo:</strong> {carro.modelo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 border-gray-300`} style={{backgroundColor: carro.cor.toLowerCase()}} />
                            <span className="text-sm"><strong>Cor:</strong> {carro.cor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                              <strong>Valor:</strong> R$ {carro.valor.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant={carro.pago ? "destructive" : "default"}
                              onClick={() => togglePagamento(carro.id, 'carro')}
                              className="w-full transition-all duration-300"
                              disabled={isLoading}
                            >
                              {carro.pago ? <X className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                              {carro.pago ? "Marcar Pendente" : "Marcar Pago"}
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removerVeiculo(carro.id, 'carro')}
                              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          {/* Lista de Motos */}
          <TabsContent value="motos">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {filtrarVeiculos(motos).map((moto, index) => (
                  <motion.div
                    key={moto.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ scale: 0, opacity: 0, rotateX: 90 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Bike className="h-5 w-5 text-teal-500" />
                            </motion.div>
                            {moto.placa}
                          </CardTitle>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Badge 
                              variant={moto.pago ? "default" : "destructive"}
                              className={moto.pago ? "bg-teal-500 hover:bg-teal-600" : ""}
                            >
                              {moto.pago ? "Pago" : "Pendente"}
                            </Badge>
                          </motion.div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm"><strong>Modelo:</strong> {moto.modelo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border-2 border-gray-300`} style={{backgroundColor: moto.cor.toLowerCase()}} />
                            <span className="text-sm"><strong>Cor:</strong> {moto.cor}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-teal-500" />
                            <span className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                              <strong>Valor:</strong> R$ {moto.valor.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              variant={moto.pago ? "destructive" : "default"}
                              onClick={() => togglePagamento(moto.id, 'moto')}
                              className="w-full transition-all duration-300"
                              disabled={isLoading}
                            >
                              {moto.pago ? <X className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                              {moto.pago ? "Marcar Pendente" : "Marcar Pago"}
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removerVeiculo(moto.id, 'moto')}
                              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16 bg-card/30 backdrop-blur-sm border-t border-border/50 p-6"
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Estacionamento Fonte Nova - Sistema desenvolvido com React e Tailwind CSS por <strong>João Daniel</strong>
          </p>
        </div>
      </motion.footer>
    </div>
  )
}

export default App

