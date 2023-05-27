import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import {
  type Path,
  type FieldValues,
  type UseFormRegister,
  type FieldError,
  type RegisterOptions,
} from "react-hook-form";
import tailwindColors from "tailwindcss/colors";

type InputProps<T extends FieldValues> =
  React.ComponentPropsWithoutRef<"input"> & {
    label: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    error?: FieldError;
    registerOptions?: RegisterOptions;
    positiveIntegerInput?: boolean;
  };

const Input = <T extends FieldValues>(props: InputProps<T>) => {
  const {
    register,
    label,
    error,
    registerOptions,
    positiveIntegerInput,
    ...inputProps
  } = props;

  const styleVariants = {
    error: "input-error",
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const notAllowedKeys = ["-", "+", "e", "E", ".", ","];
    if (notAllowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  };

  if (positiveIntegerInput) {
    inputProps.onKeyDown = handleKeyPress;
  }

  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={props.name}>
        <span className="label-text font-medium">{label}</span>
      </label>
      <input
        className={clsx("input-primary input w-full", {
          [styleVariants.error]: error?.message,
        })}
        id={props.name}
        maxLength={255 || inputProps.maxLength}
        {...register(props.name, registerOptions)}
        {...inputProps}
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
