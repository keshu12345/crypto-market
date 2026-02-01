import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

export const WalletButton: React.FC = () => {
  const { publicKey } = useWallet();

  return (
    <div className="flex items-center space-x-2">
      {publicKey && (
        <span className="text-sm text-gray-300">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
      )}
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !rounded" />
    </div>
  );
};