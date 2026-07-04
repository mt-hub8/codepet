import { petBubbleMessages, petStateLabels, type PetState } from "./petState";

type PetBubbleProps = {
  state: PetState;
  message?: string;
};

export function PetBubble({ state, message }: PetBubbleProps) {
  return (
    <section className="pet-bubble" aria-live="polite">
      <span>{petStateLabels[state]}</span>
      <p>{message || petBubbleMessages[state]}</p>
    </section>
  );
}
