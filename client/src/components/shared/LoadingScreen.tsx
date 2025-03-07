import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Carregando...' }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
      <div className="animate-pulse-custom">
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0H40C51.0457 0 60 8.95431 60 20C60 31.0457 51.0457 40 40 40H20C8.95431 40 0 31.0457 0 20C0 8.95431 8.95431 0 20 0Z" fill="hsl(var(--primary))"/>
          <path d="M80 0H100C111.046 0 120 8.95431 120 20C120 31.0457 111.046 40 100 40H80C68.9543 40 60 31.0457 60 20C60 8.95431 68.9543 0 80 0Z" fill="hsl(var(--primary))"/>
          <text x="15" y="25" fontFamily="Arial" fontSize="16" fontWeight="700" fill="white">BRASI</text>
          <text x="75" y="25" fontFamily="Arial" fontSize="16" fontWeight="700" fill="white">LIT</text>
        </svg>
      </div>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingScreen;
