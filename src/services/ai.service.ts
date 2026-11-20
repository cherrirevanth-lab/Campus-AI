/**
 * Abstract AI service boundary.
 *
 * Phase 1 ships the interface and a placeholder implementation only. Wiring a
 * real model (RAG over campus content) happens behind this contract so no UI
 * needs to change later.
 */
export interface AiAnswerSource {
  label: string;
  url?: string;
}

export interface AiAnswer {
  text: string;
  sources: AiAnswerSource[];
}

export interface AiService {
  ask(question: string): Promise<AiAnswer>;
  isEnabled(): boolean;
}

export const aiService: AiService = {
  isEnabled: () => false,
  async ask() {
    throw new Error("AI service is not connected yet.");
  },
};
