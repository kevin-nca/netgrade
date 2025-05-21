import { useState } from 'react';

export const useFormHandler = <T extends Record<string, any>>(
  initialState: T,
) => {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    setFormData,
    handleChange,
  };
};
