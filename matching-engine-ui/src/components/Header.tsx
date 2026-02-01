import React from 'react';
import { WalletButton } from './WalletButton';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Solana DEX</h1>
          <nav className="hidden md:flex space-x-4">
            <a href="#" className="hover:text-blue-400">Trade</a>
            <a href="#" className="hover:text-blue-400">Portfolio</a>
            <a href="#" className="hover:text-blue-400">Markets</a>
          </nav>
        </div>
        <WalletButton />
      </div>
    </header>
  );
};