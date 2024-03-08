import { Fragment, ReactNode } from "react"
import Nav from "@/components/Nav"

type BaseLayoutProps = {
  children: ReactNode
}

const AuthLayout = (props: BaseLayoutProps) => {
  const { children } = props
  return (
    <Fragment>
      <div className="">
        <Nav />
        {children}
      </div>
    </Fragment>
  )
}

export default AuthLayout;