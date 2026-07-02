import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../pages/LoginPage';

const mockStore = configureStore({
  reducer: {
    auth: (state = { isAuthenticated: false, user: null, token: null }) => state,
  },
});

const queryClient = new QueryClient();

describe('LoginPage Component Tests', () => {
  it('renders login details and social options', () => {
    render(
      <Provider store={mockStore}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>,
    );

    // Verify title text and form elements
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();

    // Verify Google and GitHub buttons are present
    expect(screen.getByText(/Google/i)).toBeInTheDocument();
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
  });
});
