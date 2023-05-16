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

type SelectProps<T extends FieldValues> = React.ComponentProps<"select"> & {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  registerOptions?: RegisterOptions;
};

const Select = <T extends FieldValues>(props: SelectProps<T>) => {
  const { register, label, error, registerOptions, children, ...inputProps } =
    props;

  const styleVariants = {
    error: "select-error",
  };

  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={props.name}>
        <span className="label-text font-medium">{label}</span>
      </label>
      <select
        className={clsx("select-primary select w-full", {
          [styleVariants.error]: error?.message,
        })}
        id={props.name}
        {...inputProps}
        {...register(props.name, registerOptions)}
      >
        {children}
      </select>
      {props.multiple && (
        <label className="label">
          <span className="label-text-alt">
            Mantenha pressionado a tecla (ctrl) para selecionar várias opções
          </span>
        </label>
      )}
      {error && (
        <div className="mt-1 flex items-center gap-1">
          <ExclamationCircleIcon color={tailwindColors.red[500]} width={20} />
          <span className="text-sm text-red-500">{error.message}</span>
        </div>
      )}
    </div>
  );
};

export default Select;
