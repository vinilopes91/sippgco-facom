import React, { forwardRef } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import tailwindColors from "tailwindcss/colors";

type FileInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  label: string;
  errorMessage?: string;
};

const FileInput = (
  props: FileInputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const { label, errorMessage, ...inputProps } = props;

  const styleVariants = {
    error: "file-input-error",
  };

  return (
    <div className="form-control w-full">
      <label className="label" htmlFor={props.name}>
        <span className="label-text font-medium">{label}</span>
      </label>
      <div className="flex items-center justify-between">
        <input
          className={clsx(
            "file-input-bordered file-input-primary file-input w-full",
            {
              [styleVariants.error]: errorMessage,
            }
          )}
          id={props.name}
          type="file"
          ref={ref}
          {...inputProps}
        />
      </div>
      {errorMessage && (
        <div className="mt-1 flex items-center gap-1">
          <ExclamationCircleIcon color={tailwindColors.red[500]} width={20} />
          <span className="text-sm text-red-500">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default forwardRef(FileInput);
