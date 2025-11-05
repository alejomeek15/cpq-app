import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/ui/button.jsx';
import { Input } from '@/ui/input.jsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card.jsx";
import { Alert, AlertDescription } from "@/ui/alert.jsx"; // Para mostrar errores
import { AlertCircle } from 'lucide-react';

/**
 * Página de inicio de sesión.
 * Recibe la instancia 'auth' de Firebase como prop.
 */
const LoginPage = ({ auth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Intenta iniciar sesión con Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged en App.jsx se encargará del resto (mostrar la app)
    } catch (err) {
      // Manejo de errores comunes de Firebase Auth
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
    // No necesitamos setLoading(false) en el 'try' porque el componente se desmontará
  };

  return (
    // Contenedor para centrar el formulario en toda la pantalla
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Bienvenido a Cepequ</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {/* Muestra el error si existe */}
            {error && (
              <Alert variant="destructive" className="bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo Electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@tuempresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;