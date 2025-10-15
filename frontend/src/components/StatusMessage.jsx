import PropTypes from "prop-types";

const toneClasses = {
  idle: "bg-slate-900/80 border-slate-800 text-slate-300",
  loading: "bg-indigo-900/50 border-indigo-500/50 text-indigo-200",
  success: "bg-emerald-900/40 border-emerald-500/60 text-emerald-200",
  error: "bg-rose-900/50 border-rose-600/50 text-rose-100"
};

export default function StatusMessage({ status }) {
  if (!status?.message) {
    return null;
  }

  const tone = toneClasses[status.level] || toneClasses.idle;

  return (
    <div className={`card border ${tone}`}>
      <p className="text-sm leading-relaxed">{status.message}</p>
      {status.details && (
        <p className="mt-2 text-xs text-slate-400">
          {Array.isArray(status.details) ? status.details.join(", ") : status.details}
        </p>
      )}
    </div>
  );
}

StatusMessage.propTypes = {
  status: PropTypes.shape({
    level: PropTypes.oneOf(["idle", "loading", "success", "error"]),
    message: PropTypes.string,
    details: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
  })
};
