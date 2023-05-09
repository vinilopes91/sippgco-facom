import clsx from "clsx";

const Container = (props: React.ComponentProps<"div">) => {
  return (
    <div
      className={clsx(
        props.className
          ? `container mx-auto px-4 ${props.className}`
          : "container mx-auto px-4"
      )}
    >
      {props.children}
    </div>
  );
};

export default Container;
