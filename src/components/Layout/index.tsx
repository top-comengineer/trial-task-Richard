import { useRouter } from "next/router";
import * as React from "react";
import { ReactNode } from "react";

import AuthLayout from "./AuthLayout";
import MainLayout from "./MainLayout";
import Spinning from "../Common/Spinning";
import useGlobalContext from "@/hook/useGlobalContext";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout(props: LayoutProps) {
  const { children } = props;
  const router = useRouter();

  const { state } = useGlobalContext();

  let LayoutComponent;

  switch (router.pathname) {
    case "/auth/login":
    case "/auth/signup":
      LayoutComponent = AuthLayout;
      break;

    default:
      LayoutComponent = MainLayout;
      break;
  }

  return (
    <React.Fragment>
      {state?.isLoading ? (
        <Spinning />
      ) : (
        <LayoutComponent>{children}</LayoutComponent>
      )}
    </React.Fragment>
  );
}
