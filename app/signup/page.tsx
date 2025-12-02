import CreateAccountForm from "@/components/CreateAccountForm";
import AuthRedirect from "@/components/AuthRedirect";

export default function SignUpPage() {
  return (
    <AuthRedirect>
      <CreateAccountForm />
    </AuthRedirect>
  );
}
