
'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { doc, getDoc } from "firebase/firestore";
import { logUserLogin } from "@/ai/flows/user-activity";
import ReCAPTCHA from "react-google-recaptcha";
import { getSettings } from "@/ai/flows/settings-management";
import type { SecuritySettings } from '@/ai/flows/settings-management.types';
import { verifyRecaptcha } from '@/ai/flows/verify-recaptcha';
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { syncSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const appSettings = await getSettings();
        setSecuritySettings(appSettings.general?.security ?? null);
      } catch (error) {
        console.error("Failed to load security settings", error);
      }
    }
    fetchSettings();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (securitySettings?.enableRecaptcha) {
        if (!recaptchaValue) {
            toast({ title: "Verification Required", description: "Please complete the reCAPTCHA.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
        try {
            const verification = await verifyRecaptcha(recaptchaValue);
            if (!verification.success) throw new Error(verification.message);
        } catch (error: any) {
             toast({ title: "reCAPTCHA Failed", description: error.message, variant: "destructive" });
             recaptchaRef.current?.reset();
             setIsSubmitting(false);
             return;
        }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const synced = await syncSession(user);
      if (!synced) {
          throw new Error('Session synchronization failed. Please try again.');
      }

      await logUserLogin(user.uid);
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const role = userDocSnap.exists() ? userDocSnap.data().role : 'user';

      toast({ title: "Welcome back!", description: "Accessing your dashboard..." });
      
      const targetUrl = searchParams.get('redirectUrl') || (role === 'admin' ? '/admin/dashboard' : '/dashboard');
      
      // Force hard reload to ensure cookie is picked up by Middleware
      window.location.href = targetUrl;
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" });
      setIsSubmitting(false);
    } finally {
        recaptchaRef.current?.reset();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
           <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <Logo />
            <span className="text-2xl font-bold">ToolifyAI</span>
          </Link>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
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
                       <FormLabel>Password</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormMessage />
                        <div className="text-right">
                         <Link href="/forgot-password">
                            <span className="text-sm text-primary hover:underline">Forgot Password?</span>
                         </Link>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              {securitySettings?.enableRecaptcha && securitySettings.recaptchaSiteKey && (
                <div className="flex justify-center">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={securitySettings.recaptchaSiteKey}
                        onChange={(v) => setRecaptchaValue(v)}
                    />
                </div>
               )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Logging in...</> : "Log In"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
