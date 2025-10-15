import PropTypes from "prop-types";

export default function MintButton({ disabled, isLoading, onMint }) {
  return (
    <div className="card space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Mintar NFT sem gas</h2>
        <p className="mt-2 text-sm text-slate-300">
          Assine a requisição off-chain. Nosso relayer enviará a transação para a Sepolia e você
          receberá o NFT automaticamente.
        </p>
      </div>

      <button
        type="button"
        className="button-primary w-full"
        onClick={onMint}
        disabled={disabled || isLoading}
      >
        {isLoading ? "Enviando assinatura..." : "Assinar e mintar"}
      </button>
    </div>
  );
}

MintButton.propTypes = {
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  onMint: PropTypes.func.isRequired
};
