
export interface Recipe {
  title: string;
  description: string;
  ingredients: {
    used: string[];
    additional: string[];
  };
  instructions: string[];
  prepTime: string;
  cookTime: string;
}
