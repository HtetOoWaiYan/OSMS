"use server";

import { revalidatePath } from "next/cache";
import { 
  type InviteUserData, 
  inviteUserSchema,
  type UpdateUserRoleData,
  updateUserRoleSchema,
  type RemoveUserData,
  removeUserSchema,
  type ResendInvitationData,
  resendInvitationSchema
} from "@/lib/validations/users";
import { 
  getProjectUsers, 
  inviteUserToProject, 
  updateUserRole,
  removeUserFromProject,
  resendUserInvitation
} from "@/lib/data/users";

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

export async function updateUserRoleAction(data: UpdateUserRoleData) {
  try {
    // Validate the input data
    const validatedData = updateUserRoleSchema.parse(data);

    // Call the data layer to update user role
    const result = await updateUserRole(validatedData);

    if (result.success) {
      // Revalidate the users page to show the updated role
      revalidatePath("/dashboard/[project-id]/users");
    }

    return result;
  } catch (error) {
    console.error("Error in updateUserRoleAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user role",
    };
  }
}

export async function removeUserAction(data: RemoveUserData) {
  try {
    // Validate the input data
    const validatedData = removeUserSchema.parse(data);

    // Call the data layer to remove user
    const result = await removeUserFromProject(validatedData);

    if (result.success) {
      // Revalidate the users page to show the user removed
      revalidatePath("/dashboard/[project-id]/users");
    }

    return result;
  } catch (error) {
    console.error("Error in removeUserAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove user",
    };
  }
}

export async function resendInvitationAction(data: ResendInvitationData) {
  try {
    // Validate the input data
    const validatedData = resendInvitationSchema.parse(data);

    // Call the data layer to resend invitation
    const result = await resendUserInvitation(validatedData);

    if (result.success) {
      // Revalidate the users page to show the invitation sent
      revalidatePath("/dashboard/[project-id]/users");
    }

    return result;
  } catch (error) {
    console.error("Error in resendInvitationAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to resend invitation",
    };
  }
}
