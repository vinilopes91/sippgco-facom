import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
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
    error: "input input-bordered input-error w-full",
  };

  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <input
        className={clsx("input-bordered input-primary input w-full", {
          [styleVariants.error]: error?.message,
        })}
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
