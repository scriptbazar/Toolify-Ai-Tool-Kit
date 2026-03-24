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
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import ReCAPTCHA from "react-google-recaptcha";
import { getSettings } from "@/ai/flows/settings-management";
import type { SecuritySettings } from '@/ai/flows/settings-management.types';
import { verifyRecaptcha } from '@/ai/flows/verify-recaptcha';
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  userName: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "At least 8 characters required." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const { toast } = useToast();
  const { syncSession } = useAuth();
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (securitySettings?.enableRecaptcha) {
        if (!recaptchaValue) {
            toast({ title: "Verification Required", description: "Please complete reCAPTCHA.", variant: "destructive" });
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

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        userName,
        email,
        role: "user",
        createdAt: new Date(),
        planId: "free",
      });

      const synced = await syncSession(user);
      if (!synced) throw new Error('Session synchronization failed.');

      toast({ title: "Account created!" });
      
      window.location.assign('/dashboard');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    } finally {
        recaptchaRef.current?.reset();
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
           <Link href="/" className="flex justify-center items-center gap-2 mb-4">
            <Logo />
            <span className="text-2xl font-bold">ToolifyAI</span>
          </Link>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join us to start exploring our smart toolkit</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="John" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="userName" render={({ field }) => (
                    <FormItem><FormLabel>User Name</FormLabel><FormControl><Input placeholder="johndoe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><div className="relative"><FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm</FormLabel><div className="relative"><FormControl><Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} /></FormControl><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div><FormMessage /></FormItem>
                )} />
              </div>
              {securitySettings?.enableRecaptcha && securitySettings.recaptchaSiteKey && (
                <div className="flex justify-center">
                    <ReCAPTCHA ref={recaptchaRef} sitekey={securitySettings.recaptchaSiteKey} onChange={(v) => setRecaptchaValue(v)} />
                </div>
               )}
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin"/>Creating account...</> : <><UserPlus className="h-4 w-4"/>Sign Up</>}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
