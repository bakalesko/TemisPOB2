import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SimpleAuthProps {
  onAuthenticated: () => void;
}

export function SimpleAuth({ onAuthenticated }: SimpleAuthProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_ATTEMPTS = 5;

  // Generate dynamic monthly password: Temis + (month letters)²
  const getDynamicPassword = (): string => {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
    const letterCount = currentMonth.length;
    const squared = letterCount * letterCount;
    return `Temis${squared}`;
  };

  const validatePassword = (inputPassword: string): boolean => {
    // Master password
    if (inputPassword === 'BaKaLa!)80') {
      return true;
    }

    // Dynamic monthly password
    const dynamicPassword = getDynamicPassword();
    if (inputPassword === dynamicPassword) {
      return true;
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= MAX_ATTEMPTS) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = validatePassword(password);
      
      if (isValid) {
        onAuthenticated();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setError('Maximum attempts reached. Please refresh the page to try again.');
        } else {
          setError(`Invalid password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const dynamicPassword = getDynamicPassword();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Muster Station Access
            </h1>
            <p className="text-gray-600">
              Enter password to access the application
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                disabled={isLoading || attempts >= MAX_ATTEMPTS}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || attempts >= MAX_ATTEMPTS}
            >
              {isLoading ? 'Checking...' : 'Access Application'}
            </Button>
          </form>


        </CardContent>
      </Card>
    </div>
  );
}