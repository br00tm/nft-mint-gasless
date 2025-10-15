import PropTypes from "prop-types";
import { TARGET_CHAIN_ID } from "../utils/constants.js";

function truncateAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletConnect({ account, chainId, isConnecting, onConnect }) {
  const isWrongNetwork = account && chainId && chainId !== TARGET_CHAIN_ID;

  return (
    <div className="card space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-300">
          Carteira
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">Conecte sua carteira</h2>
        <p className="mt-2 text-sm text-slate-300">
          Use a MetaMask na rede Sepolia para assinar a mensagem de mintagem sem pagar gas.
        </p>
      </div>

      <button
        type="button"
        className="button-primary w-full"
        onClick={onConnect}
        disabled={isConnecting}
      >
        {isConnecting ? "Conectando..." : account ? "Carteira conectada" : "Conectar MetaMask"}
      </button>

      {account && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm">
          <p className="text-slate-300">
            <span className="font-semibold text-white">Endereço:</span>{" "}
            <span>{truncateAddress(account)}</span>
          </p>
          <p className="mt-2 text-slate-300">
            <span className="font-semibold text-white">Rede:</span>{" "}
            {chainId ? `0x${chainId.toString(16)}` : "desconhecida"}
          </p>
          {isWrongNetwork && (
            <p className="mt-2 text-sm text-amber-400">
              Troque para a rede Sepolia antes de continuar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

WalletConnect.propTypes = {
  account: PropTypes.string,
  chainId: PropTypes.number,
  isConnecting: PropTypes.bool,
  onConnect: PropTypes.func.isRequired
};
