import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from '@tanstack/react-form';
import { SubjectName } from '@/components/Form/FormElements/SubjectName';

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
    defaultValues: { subjectName: '' },
    onSubmit,
  });

  return <form.Provider>{children}</form.Provider>;
};

describe('SubjectName FormElement', () => {
  it('should render with default props', () => {
    const mockForm = {
      Field: ({ children }: any) =>
        children({
          state: { value: '' },
          handleChange: vi.fn(),
        }),
    };

    render(<SubjectName form={mockForm} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByLabelText('Fach')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Fachname eingeben'),
    ).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    const mockForm = {
      Field: ({ children }: any) =>
        children({
          state: { value: 'Mathematics' },
          handleChange: vi.fn(),
        }),
    };

    render(
      <SubjectName
        form={mockForm}
        fieldName="customSubjectName"
        placeholder="Custom placeholder"
        label="Custom Label"
        disabled={true}
      />,
    );

    expect(screen.getByDisplayValue('Mathematics')).toBeInTheDocument();
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

    render(<SubjectName form={mockForm} />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Physics' },
    });
    expect(mockHandleChange).toHaveBeenCalledWith('Physics');
  });
});
