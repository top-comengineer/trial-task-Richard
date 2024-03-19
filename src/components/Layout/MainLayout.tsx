import { Fragment, ReactNode } from "react";
import MainNav from "../Nav/MainNav";

type MainLayoutProps = {
  children: ReactNode;
};

const MainLayout = (props: MainLayoutProps) => {
  const { children } = props;
  return (
    <Fragment>
      <div className="no-scrollbar flex h-screen flex-col overflow-hidden">
        <MainNav />
        {children}
      </div>
    </Fragment>
  );
};

export default MainLayout;
