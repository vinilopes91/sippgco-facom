const Container = (props: React.ComponentProps<"div">) => {
  const defaultClasses = "container mx-auto px-4";

  return (
    <div
      className={
        props.className
          ? `${defaultClasses} ${props.className}`
          : defaultClasses
      }
    >
      {props.children}
    </div>
  );
};

export default Container;
