import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/Common/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Common/Form";
import { Input } from "@/components/Common/Input";
import Link from "next/link";

const FormSchema = z.object({
  email: z.string().email({
    message: "Please enter the valid email address.",
  }),
  password: z.string().nonempty({
    message: "Please enter your password.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password don't match.",
  path: ["confirmPassword"],
});

const SignUp = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("data", data, form.formState.errors);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto my-auto flex w-[320px] flex-col gap-5 rounded-2xl p-10 shadow-md sm:w-[400px] md:w-[576px] lg:w-[576px]"
      >
        <div className="flex flex-col gap-6 py-4">
          <p className="text-center text-3xl font-bold">Sign Up</p>
          <div className="flex justify-center gap-2">
            <p className="text-center text-lg">Already joined?</p>
            <Link
              href="/auth/login"
              className="text-lg text-sky-400 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email"
                  {...field}
                  className={
                    form.formState.errors.email ? "border-red-500" : ""
                  }
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
              <FormLabel className="text-base">Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="password"
                  {...field}
                  className={
                    form.formState.errors.password ? "border-red-500" : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Confirm Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="confirm password"
                  {...field}
                  className={
                    form.formState.errors.confirmPassword ? "border-red-500" : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-3 bg-sky-300 hover:bg-sky-400">
          SignUp
        </Button>
      </form>
    </Form>
  );
};

export default SignUp;
