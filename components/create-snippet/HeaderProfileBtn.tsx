"use client";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";
import { Button } from "../ui/button";

function HeaderProfileBtn() {
  return (
    <>
      <SignedIn>
        <UserButton>
          <UserButton.MenuItems>
            <UserButton.Link
              label="Profile"
              labelIcon={<User className="size-4" />}
              href="/profile"
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
      <SignedOut>
        <Button variant="ghost" className="text-sm font-medium">
          Log in
        </Button>
      </SignedOut>
    </>
  );
}
export default HeaderProfileBtn;
