import { useWallet } from '../../hooks/useWallet';
import toast from 'react-hot-toast';

export default function ConnectWallet() {
  const { account, isConnected, connect, disconnect } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Wallet connected');
    } catch (err) {
      toast.error(err.message || 'Failed to connect wallet');
    }
  };

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
          <span className="flex h-2 w-2 rounded-full bg-green-500" />
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
        <button
          onClick={disconnect}
          className="rounded-lg px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-100"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
      </svg>
      Connect Wallet
    </button>
  );
}
