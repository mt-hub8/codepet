import { petStateLabels, petStates, type PetState } from "./petState";

type PetStatusPanelProps = {
  currentState: PetState;
  onChange: (state: PetState) => void;
};

export function PetStatusPanel({ currentState, onChange }: PetStatusPanelProps) {
  return (
    <section className="status-panel" aria-label="状态测试面板">
      {petStates.map((state) => (
        <button
          key={state}
          className={state === currentState ? "active" : ""}
          type="button"
          onClick={() => onChange(state)}
        >
          {petStateLabels[state]}
        </button>
      ))}
    </section>
  );
}

