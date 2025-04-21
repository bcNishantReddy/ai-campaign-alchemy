
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Index from './Index';

// Extend Jest 'expect' with jest-dom matchers
import '@testing-library/jest-dom';

describe('Landing Page (Index)', () => {
  test('renders main header and CTA', () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );
    expect(screen.getByText(/Revolutionize Your Sales Outreach/i)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /get started/i })[0]).toBeInTheDocument();
  });

  test('renders Features, Dashboard, and Pricing sections', () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );
    expect(screen.getByText(/AI-powered personalized email generation/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Pricing/i)).toBeInTheDocument();
  });
});
