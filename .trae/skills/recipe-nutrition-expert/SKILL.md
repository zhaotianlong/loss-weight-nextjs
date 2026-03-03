---
name: "recipe-nutrition-expert"
description: "Generates daily and weekly menus, performs nutrition analysis (calories, protein, carbs, fat), and recommends recipes. Invoke when planning meals or managing recipe data."
---

# Recipe & Nutrition Expert

This skill specializes in meal planning and nutritional balance for the fitness camp.

## Core Capabilities

1.  **Menu Generation**:
    -   Supports **Single Day** and **Weekly Batch** (cycle) modes.
    -   Allocates meals across time slots: Breakfast (07:30), Lunch (12:00), Dinner (18:00), and Snacks.
    -   Uses `POST /duties/batch-recipes` for weekly cycle planning.

2.  **Nutrition Analysis**:
    -   Calculates total calories, protein, carbs, and fat for each meal and the whole day.
    -   Ensures caloric targets are met based on student counts (e.g., default 2000kcal/person).
    -   Standard distribution: Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%.

3.  **Recipe Management**:
    -   Filters recipes by category (`breakfast`, `lunch`, `dinner`, `snack`).
    -   Handles calories and nutritional values in `src/mock/data/recipe.ts`.

4.  **Integration with Schedule**:
    -   Meal plans are stored as `duty` records with `type: 'meal'`.
    -   Displayed in the "Today's Schedule" section of the Dashboard.

## Key Service Integration

-   `getRecipeList`: Fetches available recipes.
-   `batchCreateRecipes`: Implements the weekly pattern logic.
-   `getDutyList`: Retrieves planned meals for specific dates.

## Weekly Pattern Structure

```json
{
  "campId": 101,
  "startDate": "2025-01-20",
  "endDate": "2025-02-16",
  "patterns": [
    {
      "dayOfWeek": 1,
      "meals": [
        { "mealType": "breakfast", "recipeId": "REC001", "timeSlot": "07:00-08:00", "location": "食堂A" }
      ]
    }
  ]
}
```
