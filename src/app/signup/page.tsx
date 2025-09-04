
'use client';

import { useState, useEffect } from "react";
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
import { doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { trackAffiliateClick } from "@/ai/flows/user-management";
import { getSettings } from "@/ai/flows/settings-management";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";


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
  recaptcha: z.boolean().optional(),
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
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      recaptcha: false,
    },
  });

  useEffect(() => {
    async function fetchRecaptchaSettings() {
        try {
            const settings = await getSettings();
            if (settings.general?.security?.enableRecaptcha) {
                setRecaptchaEnabled(true);
            }
        } catch (error) {
            console.error("Failed to load reCAPTCHA settings", error);
        } finally {
            setLoadingSettings(false);
        }
    }
    fetchRecaptchaSettings();

    const referrerId = searchParams.get('ref');
    if (referrerId) {
      // Store the referrer ID in local storage to persist it across sessions if needed
      localStorage.setItem('referrerId', referrerId);
      
      // Track the click only if it hasn't been tracked for this session
      const trackedKey = `tracked_${referrerId}`;
      if (!sessionStorage.getItem(trackedKey)) {
        trackAffiliateClick(referrerId).then(result => {
            if (result.success) {
                console.log(`Click tracked for referrer: ${referrerId}`);
                sessionStorage.setItem(trackedKey, 'true');
            } else {
                 console.error(`Failed to track click for referrer: ${referrerId}. Reason: ${result.message}`);
            }
        });
      }
    }
  }, [searchParams]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (recaptchaEnabled && !values.recaptcha) {
        form.setError("recaptcha", { type: "manual", message: "Please verify you are not a robot." });
        return;
    }

    try {
      const { email, password, firstName, lastName, userName } = values;
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Set subscription dates for free plan
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 100); // Effectively "never" for free plan

      // Get referrer from local storage and update their stats
      const referrerId = localStorage.getItem('referrerId');
      if (referrerId) {
        const referrerRef = doc(db, "users", referrerId);
        const settings = await getSettings(); // Fetch settings to get commission rate
        const commissionRate = settings.referral?.commissionRate || 20;
        
        // In a real app, earnings would be calculated based on payments.
        // For now, let's assume a fixed earning on signup for demonstration.
        const earningsOnSignup = 0; // Or calculate based on plan if they sign up for paid plan directly

        await updateDoc(referrerRef, {
            affiliateReferrals: increment(1),
            affiliateEarnings: increment(earningsOnSignup)
        });
      }


      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        userName,
        email,
        role: "user", // Default role is 'user'
        createdAt: new Date(),
        planId: "free",
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        ...(referrerId && { referredBy: referrerId }), // Add referrer if exists
      });

      toast({
        title: "Account created successfully!",
        description: "We've sent a verification link to your email address.",
      });
      router.push('/login');
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Uh oh! Something went wrong.",
        description: error.message || "There was a problem with your request.",
        variant: "destructive",
      });
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
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Name</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                       <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-y-0 right-0 h-full px-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               {loadingSettings ? <Skeleton className="h-14 w-full" /> : recaptchaEnabled && (
                    <FormField
                      control={form.control}
                      name="recaptcha"
                      render={({ field }) => (
                         <FormItem>
                            <FormControl>
                                <div className="recaptcha-container">
                                    <Checkbox
                                        id="recaptcha-checkbox"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="recaptcha-checkbox"
                                    />
                                    <Label htmlFor="recaptcha-checkbox" className="recaptcha-label">
                                        I'm not a robot
                                    </Label>
                                    <div className="recaptcha-logo">
                                        <div className="recaptcha-icon"></div>
                                        <p className="recaptcha-text">reCAPTCHA</p>
                                        <p className="recaptcha-subtext">Privacy - Terms</p>
                                    </div>
                                </div>
                            </FormControl>
                           <FormMessage />
                        </FormItem>
                      )}
                    />
              )}
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
