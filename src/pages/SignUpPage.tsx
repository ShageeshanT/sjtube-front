import { SignUp } from "@clerk/clerk-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/logo.svg" alt="SJ Tube" className="mx-auto h-12 w-auto mb-4" />
          <p className="text-sm text-slate-500">Create your account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl border border-slate-200/60 rounded-2xl",
              headerTitle: "text-slate-900",
              headerSubtitle: "text-slate-500",
              socialButtonsBlockButton:
                "border-slate-200 hover:bg-slate-50 text-slate-700",
              formFieldInput:
                "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20",
              footerActionLink: "text-blue-600 hover:text-blue-700",
              formButtonPrimary:
                "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
