type ButtonProps = {
  fullWidth?: boolean;
} & React.ComponentProps<"button">;

const Button = ({ children, ...props }: ButtonProps) => {
  const { disabled, fullWidth } = props;

  return (
    <button
      className={`mb-4 rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium
       text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300
       ${disabled ? "cursor-not-allowed opacity-50" : ""} ${
        fullWidth ? "w-full" : "max-w-fit"
      }`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
