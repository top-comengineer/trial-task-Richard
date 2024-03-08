import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import type { GetServerSideProps, NextPage } from "next";
import { getServerAuthSession } from "@/server/auth";

const DashBoard = () => {
  const router = useRouter();

  return (
    <div className={"h-full bg-[#0b0e13]"}>
      <p className="text-white">DashBoard</p>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default DashBoard;