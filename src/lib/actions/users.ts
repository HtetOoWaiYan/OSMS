"use server";

import { revalidatePath } from "next/cache";
import { type InviteUserData, inviteUserSchema } from "@/lib/validations/users";
import { getProjectUsers, inviteUserToProject } from "@/lib/data/users";

export async function inviteUserAction(data: InviteUserData) {
  try {
    // Validate the input data
    const validatedData = inviteUserSchema.parse(data);

    // Call the data layer to invite the user
    const result = await inviteUserToProject(validatedData);

    if (result.success) {
      // Revalidate the users page to show the new invitation
      revalidatePath("/dashboard/users");
    }

    return result;
  } catch (error) {
    console.error("Error in inviteUserAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite user",
    };
  }
}

export async function getProjectUsersAction() {
  try {
    const result = await getProjectUsers();

    return result;
  } catch (error) {
    console.error("Error in getProjectUsersAction:", error);
    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : "Failed to fetch project users",
    };
  }
}
