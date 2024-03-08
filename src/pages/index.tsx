import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import { api } from "@/utils/api";
import { Fragment } from "react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

 
  return (
   <Fragment>
    <Dashboard />
   </Fragment>
  );
}

