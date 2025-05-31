import { SignedOut, UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";
import { Button } from "../ui/button";

function HeaderProfileBtn() {
  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label="Profile"
            labelIcon={<User className="size-4" />}
            href="/profile"
          />
        </UserButton.MenuItems>
      </UserButton>

      <SignedOut>
        <Button variant="ghost" className="text-sm font-medium">
          Log in
        </Button>
      </SignedOut>
    </>
  );
}
export default HeaderProfileBtn;
