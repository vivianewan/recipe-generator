
import React, { useState, useCallback, KeyboardEvent } from 'react';
import { generateRecipes } from './services/geminiService';
import { Recipe } from './types';
import ChefHatIcon from './components/icons/ChefHatIcon';
import SparklesIcon from './components/icons/SparklesIcon';
import RecipeCard from './components/RecipeCard';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>(['Tomatoes', 'Chicken Breast', 'Garlic']);
  const [newIngredient, setNewIngredient] = useState<string>('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddIngredient = useCallback(() => {
    if (newIngredient.trim() && !ingredients.map(i => i.toLowerCase()).includes(newIngredient.trim().toLowerCase())) {
      setIngredients(prev => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  }, [newIngredient, ingredients]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateRecipes = useCallback(async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const result = await generateRecipes(ingredients);
      setRecipes(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);
  
  const exampleIngredients = ['Onion', 'Bell Pepper', 'Rice', 'Cheese', 'Eggs'];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full p-4 mb-4">
            <ChefHatIcon className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">Recipe Generator</h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Turn your pantry treasures into culinary masterpieces. Just list your ingredients and let AI do the magic!
          </p>
        </header>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
          <div className="mb-4">
            <label htmlFor="ingredient-input" className="block text-sm font-medium text-gray-700 mb-2">
              Add your ingredients
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="ingredient-input"
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Avocado"
                className="flex-grow block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              />
              <button
                onClick={handleAddIngredient}
                className="px-5 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors duration-300"
              >
                Add
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2">
                Examples: {exampleIngredients.map((ing, i) => (
                    <button key={ing} onClick={() => setNewIngredient(ing)} className="hover:text-emerald-500 underline decoration-dotted">
                        {ing}{i < exampleIngredients.length - 1 && ', '}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="mb-6 min-h-[50px]">
            {ingredients.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-full animate-fade-in"
                  >
                    <span>{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="ml-2 text-emerald-500 hover:text-emerald-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleGenerateRecipes}
            disabled={isLoading || ingredients.length === 0}
            className="w-full flex items-center justify-center px-6 py-4 bg-emerald-500 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-6 w-6 mr-2"/>
                Generate Recipes
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-8 max-w-2xl mx-auto text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Oops! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {recipes.length > 0 && !isLoading && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">Your Recipe Suggestions</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe, index) => (
                <RecipeCard key={index} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
        
        {!isLoading && recipes.length === 0 && ingredients.length > 0 && !error && (
            <div className="mt-16 text-center text-gray-500">
                <p>Click "Generate Recipes" to discover what you can cook!</p>
            </div>
        )}

      </main>
    </div>
  );
};

export default App;
