import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import tailwindColors from "tailwindcss/colors";

type FileInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  label: string;
  errorMessage?: string;
};

const FileInput = (props: FileInputProps) => {
  const { label, errorMessage, ...inputProps } = props;

  const styleVariants = {
    error: "file-input-error",
  };

  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={props.name}>
        <span className="label-text font-medium">{label}</span>
      </label>
      <input
        className={clsx(
          "file-input-bordered file-input-primary file-input w-full",
          {
            [styleVariants.error]: errorMessage,
          }
        )}
        id={props.name}
        type="file"
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

export default FileInput;
