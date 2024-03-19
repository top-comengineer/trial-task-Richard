import type { GetServerSideProps, NextPage } from "next";
import { getServerAuthSession } from "@/server/auth";

import React from 'react'
import Login from "@/components/Auth/Login"

const LoginPage = () => {
  return (
    <div className='flex mx-auto flex-col h-screen'>
      <Login />
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default LoginPage; 