import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import tailwindColors from "tailwindcss/colors";

type ControlledInputProps = React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  errorMessage?: string;
  positiveIntegerInput?: boolean;
};

const ControlledInput = (props: ControlledInputProps) => {
  const { label, errorMessage, positiveIntegerInput, ...inputProps } = props;

  const styleVariants = {
    error: "input input-bordered input-error w-full",
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
      <label className="label justify-start gap-2" htmlFor={props.name}>
        <span className="label-text font-medium">{label}</span>
        {inputProps.required && (
          <span className="text-xs font-medium text-error">* Obrigatório</span>
        )}
      </label>
      <input
        className={clsx("input-bordered input-primary input w-full", {
          [styleVariants.error]: errorMessage,
        })}
        id={props.name}
        maxLength={255 || inputProps.maxLength}
        {...inputProps}
      />
      {errorMessage && (
        <div className="mt-1 flex items-center gap-1">
          <ExclamationCircleIcon color={tailwindColors.red[500]} width={20} />
          <span className="text-sm text-red-500">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ControlledInput;
