"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FadeIn, SlideUp } from "@/components/animations";
import { Loader2 } from "lucide-react";

export default function AgentProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    bio: "Luxury real estate agent with over 10 years of experience in high-end properties.",
    company: "Luxury Rentals",
    website: "https://luxuryrentals.com",
    instagram: "@luxuryrentals",
    twitter: "@luxuryrentals",
  });

  const [_passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProfileData((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [id]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been updated.",
      });
    }, 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Password updated successfully!",
        description: "Your password has been updated.",
      });
    }, 2000);
  };

  return (
    <DashboardLayout>
      <FadeIn>
        <SlideUp>
          <div className="container py-10">
            <div className="grid gap-10">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          type="text"
                          id="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          type="email"
                          id="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          type="tel"
                          id="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          type="text"
                          id="company"
                          value={profileData.company}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          type="url"
                          id="website"
                          value={profileData.website}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          type="text"
                          id="instagram"
                          value={profileData.instagram}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter">Twitter</Label>
                        <Input
                          type="text"
                          id="twitter"
                          value={profileData.twitter}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>
                    <Button disabled={isLoading} type="submit">
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Profile
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update Password</CardTitle>
                  <CardDescription>Change your password here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="grid gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        type="password"
                        id="currentPassword"
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        type="password"
                        id="newPassword"
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <Button disabled={isLoading} type="submit">
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Update Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </SlideUp>
      </FadeIn>
    </DashboardLayout>
  );
}
