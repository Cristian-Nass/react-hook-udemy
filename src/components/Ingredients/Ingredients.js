import React, { useReducer, useCallback } from 'react';

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

const httpReducer = (httpState, action) => {
  switch (action.type) {
    case 'SEND':
      return {loading: true, error: null};

    case 'RESPONSE':
      return {...httpState, loading: false};
      
    case 'ERROR':
      return {loading: false, error: action.errorMessage};

    case 'CLEAR':
      return {...httpState, error: null};

    default:
      throw new Error('some Error with http request');
  }
}

const Ingredients = () => {

  const [userIngredients, dispatch] = useReducer(ingredientReducer, [])
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null})

  const removeIngredientHandler = ingredientId => {
    dispatchHttp({type: 'SEND'});
    fetch(`https://burger-builder-59593-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: 'DELETE'
    })
    .then(() => {
      dispatchHttp({type: 'RESPONSE'});
      dispatch({type: 'DELETE', id: ingredientId});
    }).catch(error => {
      dispatchHttp({type: 'ERROR', errorMessage: error.message})
    })
  };

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    dispatch({type: 'SET', ingredients: filteredIngredients});
  }, [])

  const addIngredientHandler = ingredient => {
    dispatchHttp({type: 'SEND'});
    fetch('https://burger-builder-59593-default-rtdb.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      dispatchHttp({type: 'RESPONSE'});
      return response.json()
    }).then( responseData => {
      dispatch({type: 'ADD', ingredients: { id: responseData.name, ...ingredient }});
    });
  };

  const clearError = () => {
    dispatchHttp({type: 'CLEAR'});
  };

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
};

export default Ingredients;
