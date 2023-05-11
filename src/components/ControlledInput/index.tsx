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
      <label className="label" htmlFor={props.name}>
        <span className="label-text font-medium">{label}</span>
      </label>
      <input
        className={clsx("input-bordered input-primary input w-full", {
          [styleVariants.error]: errorMessage,
        })}
        id={props.name}
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
