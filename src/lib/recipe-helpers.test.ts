import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveRecipeIngredients } from './recipe-helpers';
import { supabase } from '@/integrations/supabase/client';
import * as ingredientParser from './ingredient-parser';

vi.mock('@/integrations/supabase/client', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

vi.mock('./ingredient-parser', () => ({
    parseIngredientInput: vi.fn(),
    findBestIngredientMatch: vi.fn(),
}));

describe('saveRecipeIngredients', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementation for supabase
        const fromMock = vi.fn().mockReturnThis();
        const insertMock = vi.fn().mockResolvedValue({ error: null });
        (supabase.from as any).mockReturnValue({
            insert: insertMock,
        });
    });

    it('should process ingredients correctly', async () => {
        const ingredientsText = '1 oeuf\n200g de farine';
        const allIngredients = [{ id: '1', name: 'oeuf' }];

        vi.mocked(ingredientParser.parseIngredientInput).mockImplementation((line) => {
            if (line === '1 oeuf') return { name: 'oeuf', quantity: 1, unit: null };
            return { name: 'farine', quantity: 200, unit: 'g' };
        });

        vi.mocked(ingredientParser.findBestIngredientMatch).mockImplementation((name, list) => {
            if (name === 'oeuf') return { id: '1', name: 'oeuf' } as any;
            return null;
        });

        await saveRecipeIngredients('recipe-id', ingredientsText, allIngredients as any);

        const fromMock = supabase.from;
        const insertMock = supabase.from('recipe_ingredients').insert;

        expect(fromMock).toHaveBeenCalledWith('recipe_ingredients');
        expect(insertMock).toHaveBeenCalledTimes(2);

        expect(insertMock).toHaveBeenNthCalledWith(1, [{
            recipe_id: 'recipe-id',
            ingredient_id: '1',
            name: 'oeuf',
            quantity: 1,
            unit: null,
        }]);

        expect(insertMock).toHaveBeenNthCalledWith(2, [{
            recipe_id: 'recipe-id',
            ingredient_id: null,
            name: 'farine',
            quantity: 200,
            unit: 'g',
        }]);
    });

    it('should not throw if allIngredients is undefined', async () => {
        // This tests for a potential crash where `allIngredients` is not passed properly
        const ingredientsText = '1 oeuf';

        vi.mocked(ingredientParser.parseIngredientInput).mockReturnValue({ name: 'oeuf', quantity: 1, unit: null });
        vi.mocked(ingredientParser.findBestIngredientMatch).mockReturnValue(null);

        // Call with undefined just in case
        await expect(saveRecipeIngredients('recipe-id', ingredientsText, undefined as any)).resolves.not.toThrow();
    });
});

describe('isCatalogRecipeTitle & isRecipeNotMine', () => {
    it('should identify catalog recipe titles correctly regardless of case or accents', async () => {
        const { isCatalogRecipeTitle } = await import('./recipe-helpers');
        expect(isCatalogRecipeTitle('Pâtes Carbonara Traditionnelles')).toBe(true);
        expect(isCatalogRecipeTitle('pates carbonara traditionnelles')).toBe(true);
        expect(isCatalogRecipeTitle('Recette totalement inconnue créée par moi')).toBe(false);
        expect(isCatalogRecipeTitle(null)).toBe(false);
    });

    it('should return true for isRecipeNotMine when recipe is from catalog or belongs to another user', async () => {
        const { isRecipeNotMine } = await import('./recipe-helpers');
        // Catalog recipe with same user_id as current user
        expect(isRecipeNotMine({ title: 'Pâtes Carbonara Traditionnelles', user_id: 'user-1' }, 'user-1')).toBe(true);

        // Custom recipe created by another user (e.g. family)
        expect(isRecipeNotMine({ title: 'Tarte secrète de mamie', user_id: 'user-2' }, 'user-1')).toBe(true);

        // Custom recipe created by current user
        expect(isRecipeNotMine({ title: 'Tarte secrète de mamie', user_id: 'user-1' }, 'user-1')).toBe(false);

        // Null / undefined recipe
        expect(isRecipeNotMine(null, 'user-1')).toBe(false);
    });
});

