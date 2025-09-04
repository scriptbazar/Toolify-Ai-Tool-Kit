
'use client';

import { useState, useEffect } from "react";
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
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import Link from "next/link";
import { getSettings } from "@/ai/flows/settings-management";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  recaptcha: z.boolean().optional(),
});

export default function AdminLoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
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
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (recaptchaEnabled && !values.recaptcha) {
        form.setError("recaptcha", { type: "manual", message: "Please verify you are not a robot." });
        return;
    }
    
    try {
      // 1. Sign in the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Check the user's role in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        // 3. If user is an admin, redirect to dashboard
        toast({
          title: "Admin login successful!",
          description: "Redirecting to the admin panel...",
        });
        router.push('/admin/dashboard');
      } else {
        // 4. If user is not an admin, show error and log out
        await auth.signOut();
        toast({
          title: "Access Denied",
          description: "You do not have permission to access the admin panel.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Admin login error:", error);
      let description = "There was a problem with your request.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        description = "Invalid email or password.";
      } else {
        description = error.message;
      }
      toast({
        title: "Login Failed",
        description,
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
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>Sign in to the ToolifyAI Admin Panel</CardDescription>
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
                        <Input placeholder="admin@example.com" {...field} />
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
              </div>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
