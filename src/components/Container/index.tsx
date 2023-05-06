type props = {
  children: React.ReactNode;
};

const Container = ({ children }: props) => {
  return <div className="container mx-auto px-4">{children}</div>;
};

export default Container;
