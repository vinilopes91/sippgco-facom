import Container from "@/components/Container";
import Header from "@/components/Header";
import { ArrowSmallLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

type BaseProps = {
  children: React.ReactNode;
  pageTitle?: string;
  backBtn?: boolean;
};

const Base = ({ children, pageTitle, backBtn }: BaseProps) => {
  const router = useRouter();

  return (
    <>
      <Header />
      <Container className="pt-4">
        <div className="flex items-center">
          {backBtn && (
            <button className="mr-4" onClick={() => router.back()}>
              <ArrowSmallLeftIcon width={24} />
            </button>
          )}
          {pageTitle && <h1 className="text-3xl font-bold">{pageTitle}</h1>}
        </div>
        {children}
      </Container>
    </>
  );
};

export default Base;
