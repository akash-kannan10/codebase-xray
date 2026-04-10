interface Props {
  mode: "beginner" | "expert";
  onChange: (mode: "beginner" | "expert") => void;
}

const ModeToggle = ({ mode, onChange }: Props) => {
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
      <button
        onClick={() => onChange("expert")}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === "expert"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Expert
      </button>
      <button
        onClick={() => onChange("beginner")}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === "beginner"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Beginner
      </button>
    </div>
  );
};

export default ModeToggle;
