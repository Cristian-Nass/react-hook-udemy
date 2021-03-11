import React, { useState, useReducer, useCallback } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredients];
    case 'DELETE': 
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('some Error');
  }
}

const Ingredients = () => {

  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])

  // const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const removeIngredientHandler = ingredientId => {
    setIsLoading(true);
    fetch(`https://burger-builder-59593-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE'
    })
    .then(() => {
      setIsLoading(false);
      // setUserIngredients(prevIngredients =>
      // prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      // );
      dispatch({type: 'DELETE', id: ingredientId});
    }).catch(error => {
      setError(error.message);
    })
  };

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients});
  }, [])

  const addIngredientHandler = ingredient => {
    setIsLoading(true);
    fetch('https://burger-builder-59593-default-rtdb.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      setIsLoading(false);
      return response.json()
    }).then( responseData => {
      // setUserIngredients(prevIngredients => [
      //   ...prevIngredients,
      //   { id: responseData.name, ...ingredient }
      // ]);
      dispatch({type: 'ADD', ingredients: { id: responseData.name, ...ingredient }});
    });
  };

  const clearError = () => {
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
};

export default Ingredients;
