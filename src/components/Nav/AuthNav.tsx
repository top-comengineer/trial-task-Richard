import { Fragment } from "react";
import { Button } from "@/components/Common/Button";
import { useRouter } from "next/router";

const AuthNav = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <Fragment>
      <div className="fixed flex justify-between w-full px-10 py-4">
        <p className="text-3xl uppercase text-white">Defi</p>

        <div className="ml-auto">
            <div className="flex gap-2">
              <Button onClick={handleLogin}>Login</Button>

              <Button className="bg-sky-500 hover:bg-sky-600 text-center" variant='none' onClick={handleSignUp}>
                Sign Up
              </Button>
            </div>
        </div>
      </div>
    </Fragment>
  );
};

export default AuthNav;
