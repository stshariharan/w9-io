type InputProps = {
  label: string;
  type: string;
  register: any; // From react-hook-form
};

export function Input({ label, type, register }: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        {...register}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-orange focus:ring-custom-orange"
      />
    </div>
  );
}
