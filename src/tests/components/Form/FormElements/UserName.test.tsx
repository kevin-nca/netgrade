import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from '@tanstack/react-form';
import { UserName } from '@/components/Form/FormElements/UserName';

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
    defaultValues: { userName: '' },
    onSubmit,
  });

  return (
    <form.Provider>
      {children}
    </form.Provider>
  );
};

describe('UserName FormElement', () => {
  it('should render with default props', () => {
    const mockForm = {
      Field: ({ children }: any) => children({
        state: { value: '' },
        handleChange: vi.fn(),
      }),
    };

    render(<UserName form={mockForm} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dein Name...')).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    const mockForm = {
      Field: ({ children }: any) => children({
        state: { value: 'John Doe' },
        handleChange: vi.fn(),
      }),
    };

    render(
      <UserName 
        form={mockForm}
        fieldName="customUserName"
        placeholder="Custom placeholder"
        label="Custom Label"
        disabled={true}
      />
    );
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
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

    render(<UserName form={mockForm} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Jane Smith' } });
    expect(mockHandleChange).toHaveBeenCalledWith('Jane Smith');
  });
});