"use client";

import { useState } from "react";
import React from "react";

import { api } from "~/trpc/react";

export function LatestRecipe() {
  const [latestPost] = api.recipe.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }]);
  const createRecipe = api.recipe.create.useMutation({
    onSuccess: async () => {
      await utils.recipe.invalidate();
      setName("");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent recipe: {latestPost.name}</p>
      ) : (
        <p>You have no recipes yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createRecipe.mutate({ name, authorId: "1", description, ingredients: [{ name: "Ingredient 1", amount: "1" }] });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder="Ingredient Name"
              value={ingredient.name}
              onChange={(e) => {
                const newIngredients = [...ingredients];
                if (newIngredients[index]) {
                  newIngredients[index].name = e.target.value;
                  setIngredients(newIngredients);
                }
              }}
              className="w-full rounded-full px-4 py-2 text-black"
            />
            <input
              type="text"
              placeholder="Amount"
              value={ingredient.amount}
              onChange={(e) => {
                const newIngredients = [...ingredients];
                if (newIngredients[index]) {
                  newIngredients[index].amount = e.target.value;
                  setIngredients(newIngredients);
                }
              }}
              className="w-full rounded-full px-4 py-2 text-black"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setIngredients([...ingredients, { name: "", amount: "" }])}
          className="rounded-full bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
        >
          + Add another ingredient
        </button>
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createRecipe.isPending}
        >
          {createRecipe.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
