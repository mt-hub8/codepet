import { petBubbleMessages, petStateLabels, type PetState } from "./petState";

type PetBubbleProps = {
  state: PetState;
};

export function PetBubble({ state }: PetBubbleProps) {
  return (
    <section className="pet-bubble" aria-live="polite">
      <span>{petStateLabels[state]}</span>
      <p>{petBubbleMessages[state]}</p>
    </section>
  );
}

