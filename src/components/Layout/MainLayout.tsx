import { Fragment, ReactNode } from "react"


type MainLayoutProps = {
  children: ReactNode;
}


const MainLayout = (props: MainLayoutProps) => {
  const { children } = props 
  return (
    <Fragment>
      <div>
        {children}
      </div>
    </Fragment>
  )
}

export default MainLayout;