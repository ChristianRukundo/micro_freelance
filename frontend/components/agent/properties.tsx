"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useAgentProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
} from "@/lib/api/agent";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Property, PropertyFormData } from "@/lib/types";

export function AgentProperties() {
  const { data: propertiesResponse, isLoading } = useAgentProperties();
  const properties = propertiesResponse?.data || [];

  const { mutate: createProperty, isPending: isCreating } = useCreateProperty();
  const { mutate: updateProperty, isPending: isUpdating } = useUpdateProperty();
  const { mutate: deleteProperty, isPending: isDeleting } = useDeleteProperty();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    location: string;
    subLocation: string;
    pricePerNight: string;
    guests: string;
    bedrooms: string;
    bathrooms: string;
    squareMeters: string;
    amenities: string[];
    status?: "active" | "inactive" | "maintenance";
  }>({
    title: "",
    description: "",
    location: "",
    subLocation: "",
    pricePerNight: "",
    guests: "",
    bedrooms: "",
    bathrooms: "",
    squareMeters: "",
    amenities: [],
    status: "active",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, amenity]
        : prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      subLocation: "",
      pricePerNight: "",
      guests: "",
      bedrooms: "",
      bathrooms: "",
      squareMeters: "",
      amenities: [],
      status: "active",
    });
  };

  const handleAddProperty = () => {
    const propertyData: PropertyFormData = {
      title: formData.title,
      description: formData.description,
      location: formData.location,
      subLocation: formData.subLocation,
      pricePerNight: Number(formData.pricePerNight),
      guests: Number(formData.guests),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      squareMeters: Number(formData.squareMeters),
      amenities: formData.amenities,
      outdoorFeatures: [],
      activities: [],
      images: ["/images/placeholder.png", "/images/placeholder.png"],
      status: formData.status || "active",
      coordinates: {
        lat: 0,
        lng: 0,
      },
    };

    createProperty(propertyData, {
      onSuccess: () => {
        toast({
          title: "Property created",
          description: "The property has been created successfully",
        });
        setIsAddDialogOpen(false);
        resetForm();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create property",
          variant: "destructive",
        });
      },
    });
  };

  const handleEditProperty = () => {
    if (!selectedProperty) return;

    const updateData: Partial<PropertyFormData> = {
      title: formData.title || undefined,
      description: formData.description || undefined,
      location: formData.location || undefined,
      subLocation: formData.subLocation || undefined,
      pricePerNight: formData.pricePerNight
        ? Number(formData.pricePerNight)
        : undefined,
      guests: formData.guests ? Number(formData.guests) : undefined,
      bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      squareMeters: formData.squareMeters
        ? Number(formData.squareMeters)
        : undefined,
      amenities: formData.amenities.length > 0 ? formData.amenities : undefined,
      status: formData.status || undefined,
    };

    updateProperty(
      {
        id: selectedProperty.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          toast({
            title: "Property updated",
            description: "The property has been updated successfully",
          });
          setIsEditDialogOpen(false);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update property",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteProperty = () => {
    if (!selectedProperty) return;

    deleteProperty(selectedProperty.id, {
      onSuccess: () => {
        toast({
          title: "Property deleted",
          description: "The property has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete property",
          variant: "destructive",
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Properties</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Properties</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Property</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new property
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Villa Luna"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      handleSelectChange("location", value)
                    }
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Nyungwe Forest National Park",
                        "Volcanoes National Park",
                        "Lake Kivu",
                      ].map((location, index) => (
                        <SelectItem value={location}  key={index} className="cursor-pointer">
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                    placeholder="2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pricePerNight">Price per night (€)</Label>
                  <Input
                    id="pricePerNight"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squareMeters">Square Meters</Label>
                  <Input
                    id="squareMeters"
                    name="squareMeters"
                    value={formData.squareMeters}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                    placeholder="150"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the property..."
                />
              </div>
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "Pool",
                    "Jacuzzi",
                    "Sauna",
                    "Gym",
                    "Air conditioning",
                    "Fireplace",
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(
                          amenity.toLowerCase()
                        )}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(
                            amenity.toLowerCase(),
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`amenity-${amenity}`}>{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddProperty} disabled={isCreating}>
                {isCreating ? "Creating..." : "Add Property"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Management</CardTitle>
          <CardDescription>
            Manage all properties in your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property: Property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>€{property.pricePerNight}</TableCell>
                  <TableCell>{property.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProperty(property);
                          setFormData({
                            title: property.title,
                            description: property.description || "",
                            location: property.location,
                            subLocation: property.subLocation || "",
                            pricePerNight: property.pricePerNight.toString(),
                            guests: property.guests.toString(),
                            bedrooms: property.bedrooms.toString(),
                            bathrooms: property.bathrooms.toString(),
                            squareMeters: property.squareMeters.toString(),
                            amenities: property.amenities || [],
                            status:
                              (property.status as
                                | "active"
                                | "inactive"
                                | "maintenance") || "active",
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProperty(property);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update the details of this property
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      handleSelectChange("location", value)
                    }
                  >
                    <SelectTrigger id="edit-location">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Greece">Greece</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subLocation">Sub Location</Label>
                  <Input
                    id="edit-subLocation"
                    name="subLocation"
                    value={formData.subLocation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price per night (€)</Label>
                  <Input
                    id="edit-price"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleInputChange}
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-guests">Guests</Label>
                  <Input
                    id="edit-guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-bedrooms">Bedrooms</Label>
                  <Input
                    id="edit-bedrooms"
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bathrooms">Bathrooms</Label>
                  <Input
                    id="edit-bathrooms"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-squareMeters">Square Meters</Label>
                  <Input
                    id="edit-squareMeters"
                    name="squareMeters"
                    value={formData.squareMeters}
                    onChange={handleInputChange}
                    type="number"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "Pool",
                    "Jacuzzi",
                    "Sauna",
                    "Gym",
                    "Air conditioning",
                    "Fireplace",
                  ].map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-amenity-${amenity}`}
                        checked={formData.amenities.includes(
                          amenity.toLowerCase()
                        )}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(
                            amenity.toLowerCase(),
                            checked as boolean
                          )
                        }
                      />
                      <Label htmlFor={`edit-amenity-${amenity}`}>
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditProperty} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Property Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProperty}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
