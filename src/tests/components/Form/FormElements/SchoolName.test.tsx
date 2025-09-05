import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from '@tanstack/react-form';
import { SchoolName } from '@/components/Form/FormElements/SchoolName';

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
    defaultValues: { schoolName: '' },
    onSubmit,
  });

  return <form.Provider>{children}</form.Provider>;
};

describe('SchoolName FormElement', () => {
  it('should render with default props', () => {
    const mockForm = {
      Field: ({ children }: any) =>
        children({
          state: { value: '' },
          handleChange: vi.fn(),
        }),
    };

    render(<SchoolName form={mockForm} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Schule')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Schulname eingeben'),
    ).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    const mockForm = {
      Field: ({ children }: any) =>
        children({
          state: { value: 'Test School' },
          handleChange: vi.fn(),
        }),
    };

    render(
      <SchoolName
        form={mockForm}
        fieldName="customSchoolName"
        placeholder="Custom placeholder"
        label="Custom Label"
        disabled={true}
      />,
    );

    expect(screen.getByDisplayValue('Test School')).toBeInTheDocument();
    expect(screen.getByLabelText('Custom Label')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Custom placeholder'),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should handle value changes', () => {
    const mockHandleChange = vi.fn();
    const mockForm = {
      Field: ({ children }: any) =>
        children({
          state: { value: '' },
          handleChange: mockHandleChange,
        }),
    };

    render(<SchoolName form={mockForm} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'New School' },
    });
    expect(mockHandleChange).toHaveBeenCalledWith('New School');
  });
});
