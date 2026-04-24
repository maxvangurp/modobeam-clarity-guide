export type CardCategory =
  | "Mind"
  | "Emotion"
  | "Action"
  | "Life Patterns"
  | "Relationships"
  | "Direction"
  | "Growth"
  | "Inner World"
  | "Shadow";

export interface OracleCard {
  id: string;
  name: string;
  keyword: string;
  category: CardCategory;
  shortMeaning: string;
  deeperMeaning: string;
  prompts: string[];
}
