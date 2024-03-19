import { Fragment, ReactNode } from "react"
import AuthNav from "@/components/Nav/AuthNav"

type BaseLayoutProps = {
  children: ReactNode
}

const AuthLayout = (props: BaseLayoutProps) => {
  const { children } = props
  return (
    <Fragment>
      <div className="">
        <AuthNav />
        {children}
      </div>
    </Fragment>
  )
}

export default AuthLayout;