import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import {
  type Path,
  type FieldValues,
  type UseFormRegister,
  type FieldError,
} from "react-hook-form";
import tailwindColors from "tailwindcss/colors";

type InputProps<T extends FieldValues> =
  React.ComponentPropsWithoutRef<"input"> & {
    label: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    error?: FieldError;
  };

const Input = <T extends FieldValues>(props: InputProps<T>) => {
  const { register, label, error, ...inputProps } = props;

  const styleVariants = {
    default: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500",
  };

  return (
    <div>
      <label
        htmlFor={props.name}
        className="mb-1 block text-sm font-medium text-slate-950"
      >
        {label}
      </label>

      <input
        className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 outline-none ${
          error?.message ? styleVariants.error : styleVariants.default
        }`}
        {...inputProps}
        {...register(props.name)}
      />

      {error && (
        <div className="mt-1 flex items-center gap-1">
          <ExclamationCircleIcon color={tailwindColors.red[500]} width={20} />
          <span className="text-sm text-red-500">{error.message}</span>
        </div>
      )}
    </div>
  );
};

export default Input;
