import LoginForm from "@/components/LoginForm";
import AuthRedirect from "@/components/AuthRedirect";

export default function LoginPage() {
  return (
    <AuthRedirect>
      <LoginForm />
    </AuthRedirect>
  );
}

