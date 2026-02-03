
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
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { trackAffiliateClick } from "@/ai/flows/user-management";
import ReCAPTCHA from "react-google-recaptcha";
import { getSettings } from "@/ai/flows/settings-management";
import type { SecuritySettings } from '@/ai/flows/settings-management.types';
import { verifyRecaptcha } from '@/ai/flows/verify-recaptcha';

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  userName: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const referrerId = searchParams.get('ref');
    if (referrerId) {
      localStorage.setItem('referrerId', referrerId);
      const trackedKey = `tracked_${referrerId}`;
      if (!sessionStorage.getItem(trackedKey)) {
        trackAffiliateClick(referrerId).then(result => {
            if (result.success) sessionStorage.setItem(trackedKey, 'true');
        });
      }
    }
  }, [searchParams]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (securitySettings?.enableRecaptcha) {
        if (!recaptchaValue) {
            toast({ title: "Verification Failed", description: "Please complete reCAPTCHA.", variant: "destructive" });
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
      const { email, password, firstName, lastName, userName } = values;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      const token = await user.getIdToken();
      const sessionResponse = await fetch('/api/auth/session-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      if (sessionResponse.ok) {
        await sessionResponse.json();
      }

      const referrerId = localStorage.getItem('referrerId');
      if (referrerId) {
        const referrerRef = doc(db, "users", referrerId);
        await updateDoc(referrerRef, {
            affiliateReferrals: increment(1),
            affiliateEarnings: increment(0)
        });
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        userName,
        email,
        role: "user",
        createdAt: new Date(),
        planId: "free",
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
        ...(referrerId && { referredBy: referrerId }),
      });

      toast({ title: "Success!", description: "Verification email sent. Please log in." });
      router.push('/login');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join ToolifyAI to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="userName" render={({ field }) => (
                    <FormItem><FormLabel>User Name</FormLabel><FormControl><Input placeholder="johndoe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><div className="relative"><FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm Password</FormLabel><div className="relative"><FormControl><Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div><FormMessage /></FormItem>
                )} />
              </div>
              {securitySettings?.enableRecaptcha && securitySettings.recaptchaSiteKey && (
                <div className="flex justify-center">
                    <ReCAPTCHA ref={recaptchaRef} sitekey={securitySettings.recaptchaSiteKey} onChange={(v) => setRecaptchaValue(v)} />
                </div>
               )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : "Sign Up"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
