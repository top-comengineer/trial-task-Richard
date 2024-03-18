import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/Common/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Common/Form";
import { Input } from "@/components/Common/Input";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import clsx from "clsx";
import { toast } from "react-toastify";

const FormSchema = z.object({
  email: z.string().email({
    message: "Please enter the valid email address.",
  }),
  password: z.string().nonempty({
    message: "Please enter your password.",
  }),
});

const Login = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const response = await signIn("credentials", {
          email: data?.email,
          password: data?.password,
          redirect: false,
        });
      

      if (!response?.error) {
        router.push("/");
      }

      if (response?.status === 401) {
        toast.error("Email or password incorrect.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto my-auto flex w-[320px] flex-col gap-5 rounded-2xl bg-[#181d2a] p-10 text-white shadow-md sm:w-[400px] md:w-[576px] lg:w-[576px]"
      >
        <div className="flex flex-col gap-6 py-4">
          <p className="text-center text-3xl font-bold">Sign In</p>
          <div className="flex justify-center gap-2">
            <p className="text-center text-lg">Don&apos;t have account?</p>
            <Link
              href="/auth/signup"
              className="text-lg text-[#3374d9] hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Email *</FormLabel>
              <FormControl>
                <Input
                  placeholder="email"
                  {...field}
                  className={clsx(
                    form.formState.errors.email ? "border-red-500" : "",
                    "text-black",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="password"
                  {...field}
                  className={clsx(
                    form.formState.errors.password ? "border-red-500" : "",
                    "text-black",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Link href="/auth/login" className="text-sm text-white hover:underline">
          Forgot your password?
        </Link>

        <Button
          type="submit"
          variant="none"
          className="mt-3 bg-[#3374d9] text-lg hover:bg-[#4574c0]"
        >
          Login
        </Button>
      </form>
    </Form>
  );
};

export default Login;
