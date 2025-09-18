

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Edit, Save, Loader2, X, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSettings, updateSettings } from '@/ai/flows/settings-management';
import {
  PlanSchema,
  PlanFeatureSchema,
  type Plan,
  type PlanFeature,
  type PlanSettings,
} from '@/ai/flows/settings-management.types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDesc,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import dynamic from 'next/dynamic';

const SubscriberTable = dynamic(() => import('@/components/admin/SubscriberTable').then(mod => mod.SubscriberTable), {
  loading: () => <Skeleton className="h-48 w-full" />,
});


const PlanFormSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  priceSuffix: z.string().default('/ month'),
  features: z.array(z.object({ text: z.string().min(1, 'Feature text cannot be empty') })).default([]),
  isPopular: z.boolean().default(false),
  status: z.enum(['active', 'disabled']).default('active'),
});

type PlanFormValues = z.infer<typeof PlanFormSchema>;


export default function PlanManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const { toast } = useToast();

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(PlanFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      priceSuffix: '/ month',
      features: [],
      isPopular: false,
      status: 'active',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'features',
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const settings = await getSettings();
        const fetchedPlans = settings.plan?.plans || [];
        setPlans(fetchedPlans);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: 'Error',
          description: 'Could not load plans.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      form.reset({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        priceSuffix: plan.priceSuffix,
        features: plan.features.map(f => ({ text: f.text })),
        isPopular: plan.isPopular,
        status: plan.status,
      });
    } else {
      setEditingPlan(null);
      form.reset({
        name: '',
        description: '',
        price: 0,
        priceSuffix: '/ month',
        features: [],
        isPopular: false,
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };
  
  const onSubmit: SubmitHandler<PlanFormValues> = (data) => {
    const newPlan: Plan = {
      id: editingPlan?.id || `plan-${Date.now()}`,
      ...data,
      features: data.features.map((f, i) => ({ id: `feature-${i}`, text: f.text })),
    };
    
    let updatedPlans;
    if (editingPlan) {
      updatedPlans = plans.map(p => p.id === editingPlan.id ? newPlan : p);
    } else {
      updatedPlans = [...plans, newPlan];
    }
    setPlans(updatedPlans);
    handleSave(updatedPlans);
    setIsModalOpen(false);
  };


  const handleSave = async (updatedPlans: Plan[]) => {
    setIsSaving(true);
    try {
      await updateSettings({ plan: { plans: updatedPlans } });
      toast({
        title: 'Success!',
        description: 'Plan settings have been saved.',
      });
    } catch (error: any) {
      console.error('Failed to save plans:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not save plans.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
   const handleDelete = (planId: string) => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    setPlans(updatedPlans);
    handleSave(updatedPlans);
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
           <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Management</h1>
          <p className="text-muted-foreground">
            Create, customize, and manage your subscription plans.
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map(plan => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-center gap-2">
                   {plan.isPopular && <Badge>Popular</Badge>}
                   <Badge variant={plan.status === 'active' ? 'default' : 'secondary'} className={plan.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {plan.status === 'active' ? <CheckCircle className="mr-1 h-3 w-3"/> : <XCircle className="mr-1 h-3 w-3"/>}
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                   </Badge>
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-4xl font-bold mb-4">
                ${plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.priceSuffix}</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map(feature => (
                  <li key={feature.id} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    {feature.text}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => openModal(plan)}><Edit className="mr-2 h-4 w-4"/>Edit Plan</Button>
              <Button variant="destructive" className="w-full" onClick={() => handleDelete(plan.id)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
            <DialogDesc>
              {editingPlan ? `Editing the "${editingPlan.name}" plan.` : 'Create a new subscription plan for your users.'}
            </DialogDesc>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Pro Plan" /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 19.99" /></FormControl><FormMessage /></FormItem>
                )}/>
               </div>
               <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} placeholder="A short description of the plan." /></FormControl><FormMessage /></FormItem>
                )}/>
                <div>
                  <Label>Features</Label>
                  <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                         <FormField control={form.control} name={`features.${index}.text`} render={({ field }) => (
                            <FormItem className="flex-grow"><FormControl><Input {...field} placeholder="e.g., Access to all tools" /></FormControl><FormMessage /></FormItem>
                         )}/>
                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ text: '' })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Feature
                  </Button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <FormField control={form.control} name="isPopular" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Mark as Popular</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Enable Plan</FormLabel></div><FormControl><Switch checked={field.value === 'active'} onCheckedChange={checked => field.onChange(checked ? 'active' : 'disabled')} /></FormControl></FormItem>
                    )}/>
                 </div>

              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Plan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
       <Card>
        <CardHeader>
          <CardTitle>Plan Subscribers</CardTitle>
          <CardDescription>
            View all users who have subscribed to your plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <SubscriberTable />
        </CardContent>
      </Card>
    </div>
  );
}
