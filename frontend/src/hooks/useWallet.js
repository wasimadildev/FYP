import { useContext } from 'react';
import { WalletContext } from '../context/WalletContext';

/**
 * @returns {{ account: string|null, provider: object|null, signer: object|null, connect: Function, disconnect: Function, isConnected: boolean, chainId: number|null }}
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
