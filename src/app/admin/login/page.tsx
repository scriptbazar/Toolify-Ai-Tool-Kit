
'use client';

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import { getSettings } from "@/ai/flows/settings-management";
import type { SecuritySettings } from '@/ai/flows/settings-management.types';
import ReCAPTCHA from "react-google-recaptcha";
import { verifyRecaptcha } from "@/ai/flows/verify-recaptcha";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
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

    if (securitySettings?.enableRecaptcha && securitySettings.recaptchaSiteKey) {
        if (!recaptchaValue) {
            toast({
                title: "Verification Failed",
                description: "Please complete the reCAPTCHA verification.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        try {
            const verification = await verifyRecaptcha(recaptchaValue);
            if (!verification.success) {
                throw new Error(verification.message);
            }
        } catch (error: any) {
             toast({
                title: "reCAPTCHA Verification Failed",
                description: error.message || 'Could not verify reCAPTCHA.',
                variant: "destructive",
            });
            recaptchaRef.current?.reset();
            setIsSubmitting(false);
            return;
        }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        const token = await user.getIdToken(true);
        const sessionResponse = await fetch('/api/auth/session-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!sessionResponse.ok) {
          throw new Error('Failed to create secure session.');
        }

        toast({
          title: "Admin login successful!",
          description: "Redirecting to the dashboard...",
        });
        
        // Force hard refresh to ensure middleware and server components see the cookie
        window.location.href = '/admin/dashboard';
      } else {
        await auth.signOut();
        toast({
          title: "Access Denied",
          description: "This account does not have administrative privileges.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      let description = "Check your email and password.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        description = "Invalid admin credentials.";
      } else {
        description = error.message;
      }
      toast({
        title: "Login Failed",
        description,
        variant: "destructive",
      });
      setIsSubmitting(false);
    } finally {
        recaptchaRef.current?.reset();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
           <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <Logo className="h-10 w-10" />
            <span className="text-2xl font-bold tracking-tight">ToolifyAI</span>
          </Link>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <ShieldCheck className="text-primary h-6 w-6" />
            Admin Access
          </CardTitle>
          <CardDescription>Sign in to the administrative control panel</CardDescription>
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
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@toolifyai.com" {...field} disabled={isSubmitting} />
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
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSubmitting}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {securitySettings?.enableRecaptcha && securitySettings.recaptchaSiteKey && (
                <div className="flex justify-center">
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey={securitySettings.recaptchaSiteKey}
                        onChange={(value) => setRecaptchaValue(value)}
                    />
                </div>
               )}
              <Button type="submit" className="w-full font-bold h-11" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Authenticating...</> : "Log In to Admin Panel"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
