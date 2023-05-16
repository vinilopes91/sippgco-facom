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

type TextAreaProps<T extends FieldValues> = React.ComponentProps<"textarea"> & {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  registerOptions?: RegisterOptions;
};

const TextArea = <T extends FieldValues>(props: TextAreaProps<T>) => {
  const { register, label, error, registerOptions, ...inputProps } = props;

  const styleVariants = {
    error: "textarea-error",
  };

  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={props.name}>
        <span className="label-text font-medium">{label}</span>
      </label>
      <textarea
        className={clsx("textarea-primary textarea h-24 w-full", {
          [styleVariants.error]: error?.message,
        })}
        id={props.name}
        {...inputProps}
        {...register(props.name, registerOptions)}
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

export default TextArea;
