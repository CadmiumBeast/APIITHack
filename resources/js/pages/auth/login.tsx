import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <>
      <Head title="Log in" />

      <div className="min-h-screen flex items-center justify-center bg-[url('/images/bg.jpg')] bg-cover bg-center">
      
        <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden bg-white/90 backdrop-blur-sm ring-1 ring-black/10 shadow-xl">
          {/* Left Panel */}
            <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[#00b2a7] to-[#018f87] text-white w-1/2 p-10 space-y-6">
            <h2 className="text-4xl font-bold">Welcome Back!</h2>
            <p className="text-lg text-center">
                Let’s make classroom booking simpler and faster. Log in to manage your bookings and schedules.
            </p>
            <img
                src="/images/login-illustration.jpg"
                alt="Login Illustration"
                className="w-2/5"
            />
            </div>

          {/* Right Panel (Form) */}
          <div className="w-full md:w-1/2 p-8 sm:p-10">
            <h2 className="text-3xl font-semibold text-center text-[#030c0b] mb-2">
              Log in to your account
            </h2>
            <p className="text-sm text-center text-gray-600 mb-6">
              Enter your credentials to continue
            </p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-[#030c0b]">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 text-black"
                />
                <InputError message={errors.email} />
              </div>

              <div>
                <Label htmlFor="password" className="text-[#030c0b]">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 text-black"
                />
                <InputError message={errors.password} />
                {canResetPassword && (
                  <div className="mt-2 text-right">
                    <TextLink
                      href={route('password.request')}
                      className="text-sm text-[#00b2a7] hover:underline"
                    >
                      Forgot password?
                    </TextLink>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  name="remember"
                  checked={data.remember}
                  onClick={() => setData('remember', !data.remember)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-700">Remember me</Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00b2a7] hover:bg-[#019d95] text-white font-medium transition duration-200"
                disabled={processing}
              >
                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                Log In
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-gray-600">
              Don’t have an account?{' '}
              <TextLink
                href={route('register')}
                className="font-medium text-[#00b2a7] hover:underline"
              >
                Sign up
              </TextLink>
            </p>

            {status && (
              <div className="mt-4 text-center text-sm font-semibold text-green-600">
                {status}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}