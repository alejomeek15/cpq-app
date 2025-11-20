import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Alert, AlertDescription } from "@/ui/alert.jsx";
import { AlertCircle, Eye, EyeOff, FileText, TrendingUp, Users, Calculator, CheckCircle, BarChart3 } from 'lucide-react';

const LoginPage = ({ auth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          setError('No se encontró un usuario con ese correo.');
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('La contraseña es incorrecta.');
          break;
        default:
          setError('Error al iniciar sesión. Inténtalo de nuevo.');
          console.error("Error de inicio de sesión:", err);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Side - Decorative (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-fuchsia-600/30 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-600/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl animate-float-delayed"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 w-full">
          {/* Title Section */}
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-5xl xl:text-6xl font-bold text-white mb-4 tracking-tight">
              Cierra más ventas
            </h1>
            <p className="text-xl text-white/70 font-medium">
              Plataforma de cotizaciones profesionales
            </p>
          </div>
          
          {/* Floating Cards with Icons */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Card 1 - Cotizaciones */}
            <div className="
              group
              bg-white/10 backdrop-blur-md
              border border-white/20
              rounded-2xl p-6
              shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]
              hover:bg-white/15
              transition-all duration-300
              hover:scale-105
              hover:shadow-[0_12px_40px_0_rgba(139,92,246,0.3)]
              animate-slide-in-left
            ">
              <div className="flex items-center justify-between mb-3">
                <FileText className="h-8 w-8 text-violet-300" />
                <div className="bg-emerald-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-emerald-300 text-xs font-semibold">+24%</span>
                </div>
              </div>
              <h3 className="text-white text-sm font-medium mb-1">Cotizaciones</h3>
              <p className="text-3xl font-bold text-white">248</p>
            </div>
            
            {/* Card 2 - Clientes */}
            <div className="
              group
              bg-white/10 backdrop-blur-md
              border border-white/20
              rounded-2xl p-6
              shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]
              hover:bg-white/15
              transition-all duration-300
              hover:scale-105
              hover:shadow-[0_12px_40px_0_rgba(139,92,246,0.3)]
              animate-slide-in-left
              animation-delay-100
            " style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-3">
                <Users className="h-8 w-8 text-fuchsia-300" />
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-white text-sm font-medium mb-1">Clientes Activos</h3>
              <p className="text-3xl font-bold text-white">87</p>
            </div>
            
            {/* Card 3 - Conversión */}
            <div className="
              group
              bg-white/10 backdrop-blur-md
              border border-white/20
              rounded-2xl p-6
              shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]
              hover:bg-white/15
              transition-all duration-300
              hover:scale-105
              hover:shadow-[0_12px_40px_0_rgba(139,92,246,0.3)]
              animate-slide-in-left
              animation-delay-200
            " style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="h-8 w-8 text-emerald-300" />
                <div className="bg-violet-500/20 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-violet-300 text-xs font-semibold">↑ 12%</span>
                </div>
              </div>
              <h3 className="text-white text-sm font-medium mb-1">Tasa de Conversión</h3>
              <p className="text-3xl font-bold text-white">68%</p>
            </div>
            
            {/* Card 4 - Revenue */}
            <div className="
              group
              bg-white/10 backdrop-blur-md
              border border-white/20
              rounded-2xl p-6
              shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]
              hover:bg-white/15
              transition-all duration-300
              hover:scale-105
              hover:shadow-[0_12px_40px_0_rgba(139,92,246,0.3)]
              animate-slide-in-left
              animation-delay-300
            " style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="h-8 w-8 text-purple-300" />
                <Calculator className="h-5 w-5 text-white/60" />
              </div>
              <h3 className="text-white text-sm font-medium mb-1">Valor Total</h3>
              <p className="text-3xl font-bold text-white">$2.4M</p>
            </div>
          </div>
          
          {/* Decorative Icons - Large floating elements */}
          <div className="relative h-32">
            <div className="absolute left-0 top-0 opacity-20 animate-float">
              <Calculator className="h-24 w-24 text-white" />
            </div>
            <div className="absolute right-20 top-4 opacity-10 animate-float-delayed">
              <FileText className="h-32 w-32 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo/Brand could go here */}
          <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl font-bold text-foreground mb-2">
              Bienvenido a CePeQu
            </h2>
            <p className="text-muted-foreground">
              Ingresa para gestionar tus cotizaciones
            </p>
          </div>
          
          <Card className="
            border-border/50
            shadow-lg
            animate-fade-in
          " style={{ animationDelay: '0.3s' }}>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-6 pt-6">
                {error && (
                  <Alert variant="destructive" className="
                    animate-shake-fade-in
                  ">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">
                    Correo Electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="
                      h-12
                      bg-background
                      border-input
                      focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                      transition-all duration-200
                      text-base
                      placeholder:text-muted-foreground
                    "
                  />
                </div>
                
                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="
                        h-12
                        bg-background
                        border-input
                        focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                        transition-all duration-200
                        text-base pr-12
                        placeholder:text-muted-foreground
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        absolute inset-y-0 right-0 flex items-center px-4
                        text-muted-foreground hover:text-foreground
                        transition-all duration-200
                      "
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="
                    w-full h-12 text-base font-semibold
                    bg-gradient-to-r from-violet-600 to-fuchsia-600
                    hover:from-violet-500 hover:to-fuchsia-500
                    text-white
                    shadow-lg shadow-violet-500/25
                    hover:shadow-xl hover:shadow-violet-500/30
                    transition-all duration-300
                    transform hover:scale-[1.02] active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Ingresando...</span>
                    </div>
                  ) : 'Ingresar'}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p>¿Necesitas ayuda? <a href="#" className="text-violet-600 hover:text-violet-500 font-medium transition-colors">Contáctanos</a></p>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shake-fade-in {
          0% { 
            opacity: 0;
            transform: translateX(0); 
          }
          10% { transform: translateX(-10px); }
          20% { transform: translateX(10px); }
          30% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          50% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          70%, 100% { 
            opacity: 1;
            transform: translateX(0); 
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .animate-shake-fade-in {
          animation: shake-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;