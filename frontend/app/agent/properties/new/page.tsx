"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateProperty } from "@/lib/api/agent";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FadeIn, SlideUp } from "@/components/animations";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location is required"),
  subLocation: z.string().optional(),
  pricePerNight: z.coerce.number().min(1, "Price must be greater than 0"),
  guests: z.coerce.number().min(1, "Must accommodate at least 1 guest"),
  bedrooms: z.coerce.number().min(1, "Must have at least 1 bedroom"),
  bathrooms: z.coerce.number().min(1, "Must have at least 1 bathroom"),
  squareMeters: z.coerce.number().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  amenities: z.array(z.string()).optional(),
  outdoorFeatures: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AddPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createPropertyMutation = useCreateProperty();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      subLocation: "",
      pricePerNight: 0,
      guests: 1,
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 0,
      images: [],
      amenities: [],
      outdoorFeatures: [],
      activities: [],
      status: "active",
    },
  });

  const addImage = () => {
    if (imageUrl && !imageUrls.includes(imageUrl)) {
      const newImages = [...imageUrls, imageUrl];
      setImageUrls(newImages);
      form.setValue("images", newImages);
      setImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    form.setValue("images", newImages);
  };

  const onSubmit = (data: FormValues) => {
    // Ensure squareMeters is always a number and arrays are never undefined
    const safeData = {
      ...data,
      squareMeters: typeof data.squareMeters === "number" ? data.squareMeters : 0,
      amenities: Array.isArray(data.amenities) ? data.amenities : [],
      outdoorFeatures: Array.isArray(data.outdoorFeatures) ? data.outdoorFeatures : [],
      activities: Array.isArray(data.activities) ? data.activities : [],
    };
    createPropertyMutation.mutate(safeData, {
      onSuccess: () => {
        toast({
          title: "Property created",
          description: "Your property has been created successfully",
        });
        router.push("/agent/properties");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create property",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <DashboardLayout requireAgent>
      <FadeIn>
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="mt-1 text-muted-foreground">
          Create a new property listing for your portfolio
        </p>
      </FadeIn>

      <SlideUp delay={0.1} className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Luxury Villa with Ocean View"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Miami, Florida" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="subLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-location (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="South Beach" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerNight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Night ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="299" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="guests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Guests</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your property in detail..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <Label>Images</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button type="button" onClick={addImage}>
                      Add
                    </Button>
                  </div>
                  <div className="mt-4 grid gap-2 md:grid-cols-3">
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative rounded-md border p-2"
                      >
                        <Image
                          src={url || "/placeholder.svg"}
                          alt={`Property image ${index + 1}`}
                          className="h-32 w-full rounded object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() => removeImage(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.images && (
                    <p className="mt-2 text-sm text-destructive">
                      {form.formState.errors.images.message}
                    </p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="mr-2"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPropertyMutation.isPending}
                  >
                    {createPropertyMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Property
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </SlideUp>
    </DashboardLayout>
  );
}
