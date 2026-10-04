function Pips({ value, filled }: { value: number; filled: string }) {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-2.5 w-1.5 rounded-[1px] ${i <= value ? filled : "bg-rule"}`}
        />
      ))}
    </span>
  );
}

export function EffortReward({
  effortScore,
  effortHours,
  rewardScore,
}: {
  effortScore: number;
  effortHours: number;
  rewardScore: number;
}) {
  return (
    <div
      className="flex items-center gap-4 font-mono text-[0.7rem] text-ink-soft"
      aria-label={`Effort ${effortScore} of 5, about ${effortHours} hours. Reward ${rewardScore} of 5.`}
    >
      <span className="flex items-center gap-1.5">
        Effort <Pips value={effortScore} filled="bg-ink" />
        <span className="text-ink">~{effortHours}h</span>
      </span>
      <span className="flex items-center gap-1.5">
        Reward <Pips value={rewardScore} filled="bg-signal" />
      </span>
    </div>
  );
}
