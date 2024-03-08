import SignUp from "@/components/Auth/SignUp";
import type { GetServerSideProps, NextPage } from "next";
import { getServerAuthSession } from "@/server/auth";

const SignUpPage = () => {
  return (
    <div className="flex mx-auto flex-col h-screen">
      <SignUp />
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

export default SignUpPage;