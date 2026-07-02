import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchState {
  query: string;
  recent: string[];
  compareIds: string[];
}

const initialState: SearchState = {
  query: '',
  recent: [],
  compareIds: [],
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
      if (action.payload && !state.recent.includes(action.payload)) {
        state.recent.unshift(action.payload);
        if (state.recent.length > 5) {
          state.recent.pop();
        }
      }
    },
    toggleCompareProduct(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.compareIds.includes(id)) {
        state.compareIds = state.compareIds.filter((x) => x !== id);
      } else {
        if (state.compareIds.length >= 4) {
          // Limit to max 4 items
          alert('You can compare a maximum of 4 products at a time.');
          return;
        }
        state.compareIds.push(id);
      }
    },
    clearCompareList(state) {
      state.compareIds = [];
    },
  },
});

export const { setSearchQuery, toggleCompareProduct, clearCompareList } = searchSlice.actions;
export const searchReducer = searchSlice.reducer;
export default searchReducer;
