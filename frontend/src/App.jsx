import { useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import WalletConnect from "./components/WalletConnect.jsx";
import MintButton from "./components/MintButton.jsx";
import StatusMessage from "./components/StatusMessage.jsx";
import useWallet from "./hooks/useWallet.js";
import { ACCESS_NFT_ABI } from "./utils/abi.js";
import { createMintRequest, signMintRequest } from "./utils/signature.js";
import { CONTRACT_ADDRESS, DEFAULT_METADATA } from "./utils/constants.js";
import { submitMintRequest } from "./services/api.js";

export default function App() {
  const { account, chainId, provider, signer, isConnecting, connectWallet, ensureCorrectNetwork } =
    useWallet();
  const [status, setStatus] = useState({ level: "idle", message: "" });
  const [isMinting, setIsMinting] = useState(false);

  const contract = useMemo(() => {
    if (!provider || !CONTRACT_ADDRESS) {
      return null;
    }
    return new Contract(CONTRACT_ADDRESS, ACCESS_NFT_ABI, provider);
  }, [provider]);

  const handleConnect = async () => {
    try {
      setStatus({ level: "idle", message: "" });
      await connectWallet();
      await ensureCorrectNetwork();
    } catch (error) {
      setStatus({
        level: "error",
        message: error.message || "Não foi possível conectar a carteira."
      });
    }
  };

  const handleMint = async () => {
    if (!CONTRACT_ADDRESS) {
      setStatus({
        level: "error",
        message:
          "Configure a variável VITE_CONTRACT_ADDRESS no frontend para continuar."
      });
      return;
    }

    if (!account) {
      await handleConnect();
    }

    try {
      setIsMinting(true);
      setStatus({ level: "loading", message: "Preparando assinatura..." });

      const switched = await ensureCorrectNetwork();
      if (!switched) {
        throw new Error("Não foi possível trocar para a rede Sepolia.");
      }

      const activeProvider = provider || new BrowserProvider(window.ethereum);
      const activeSigner = signer || (await activeProvider.getSigner());
      const userAddress = await activeSigner.getAddress();

      const readContract =
        contract || new Contract(CONTRACT_ADDRESS, ACCESS_NFT_ABI, activeProvider);

      const nonceOnChain = await readContract.nextNonce(userAddress);
      const request = createMintRequest({
        account: userAddress,
        nonce: nonceOnChain
      });

      setStatus({ level: "loading", message: "Assinando requisição off-chain..." });

      const signature = await signMintRequest({
        signer: activeSigner,
        request
      });

      setStatus({ level: "loading", message: "Enviando para o backend..." });

      const response = await submitMintRequest({
        to: request.to,
        nonce: request.nonce.toString(),
        deadline: request.deadline.toString(),
        uri: request.uri,
        signature
      });

      setStatus({
        level: "success",
        message: "Mint enviado com sucesso! Aguarde a confirmação na blockchain.",
        details: [
          response.txHash ? `Tx hash: ${response.txHash}` : null,
          response.tokenId ? `Token ID: ${response.tokenId}` : null
        ].filter(Boolean)
      });
    } catch (error) {
      setStatus({
        level: "error",
        message: error.reason || error.message || "Falha ao realizar o mint."
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
      <div className="md:w-1/2">
        <div className="card h-full space-y-6">
          <div>
            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-200">
              Gasless Mint
            </span>
            <h1 className="mt-4 text-4xl font-extrabold text-white">
              Coleção exclusiva sem custo de gas
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Assine uma mensagem segura (EIP-712) e nosso relayer cuida das taxas. Experimente um
              fluxo de mint moderno e acessível.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
            <p className="text-sm font-semibold text-indigo-200">Próximo NFT</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{DEFAULT_METADATA.name}</h3>
            <p className="mt-2 text-sm text-slate-300">{DEFAULT_METADATA.description}</p>
            <div className="mt-4 h-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              <img
                src={DEFAULT_METADATA.image}
                alt="Pré-visualização do NFT"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        <WalletConnect
          account={account}
          chainId={chainId}
          isConnecting={isConnecting}
          onConnect={handleConnect}
        />

        <MintButton disabled={isConnecting} isLoading={isMinting} onMint={handleMint} />

        <StatusMessage status={status} />
      </div>
    </div>
  );
}
