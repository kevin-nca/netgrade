import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from '@tanstack/react-form';
import { SearchText } from '@/components/Form/FormElements/SearchText';

// Mock FormField component
vi.mock('@/components/Form/FormField', () => ({
  default: ({ label, value, onChange, placeholder, type, disabled }: any) => (
    <div data-testid="form-field">
      <label>{label}</label>
      <input
        data-testid="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
      />
    </div>
  ),
}));

// Test wrapper component that provides form context
const TestWrapper = ({ children, onSubmit = vi.fn() }: any) => {
  const form = useForm({
    defaultValues: { searchText: '' },
    onSubmit,
  });

  return (
    <form.Provider>
      {children}
    </form.Provider>
  );
};

describe('SearchText FormElement', () => {
  it('should render with default props', () => {
    const mockForm = {
      Field: ({ children }: any) => children({
        state: { value: '' },
        handleChange: vi.fn(),
      }),
    };

    render(<SearchText form={mockForm} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Suchen...')).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    const mockForm = {
      Field: ({ children }: any) => children({
        state: { value: 'search query' },
        handleChange: vi.fn(),
      }),
    };

    render(
      <SearchText 
        form={mockForm}
        fieldName="customSearchText"
        placeholder="Custom search placeholder"
        label="Search Label"
        disabled={true}
      />
    );
    
    expect(screen.getByDisplayValue('search query')).toBeInTheDocument();
    expect(screen.getByLabelText('Search Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Custom search placeholder')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should handle value changes', () => {
    const mockHandleChange = vi.fn();
    const mockForm = {
      Field: ({ children }: any) => children({
        state: { value: '' },
        handleChange: mockHandleChange,
      }),
    };

    render(<SearchText form={mockForm} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new search' } });
    expect(mockHandleChange).toHaveBeenCalledWith('new search');
  });
});