import { api } from "../lib/api";
import {
  Comment,
  CommentResponse,
  CreateCommentDto,
  DeleteCommentResponse,
} from "../types/types";

/**
 * Get all comments from a support material
 * @param supportMaterialId - ID of the support material
 * @returns Promise with array of comments
 */
export const getCommentsBySupportMaterial = async (
  supportMaterialId: string
): Promise<Comment[]> => {
  try {
    const response = await api.get<CommentResponse>(
      `/comments/support-material/${supportMaterialId}`
    );
    console.log("Comments response:", response.data);
    return response.data.data || [];
  } catch (error: any) {
    // Si es un 404, simplemente retornar array vacío sin mostrar error
    if (error?.response?.status === 404) {
      console.log("No comments found for this material");
      return [];
    }
    console.error("Error fetching comments:", error);
    throw error;
  }
};

/**
 * Create a new comment
 * @param commentData - Comment data (message and supportMaterialId)
 * @returns Promise with the created comment
 */
export const createComment = async (
  commentData: CreateCommentDto
): Promise<Comment> => {
  try {
    const response = await api.post<{ statusCode: number; message: string; data: Comment }>(
      "/comments", 
      commentData
    );
    console.log("Create comment response:", response.data);
    
    const comment = response.data.data;
    
    // Si el backend no devuelve createdAt o viene en formato incorrecto, usar fecha actual
    if (!comment.createdAt) {
      comment.createdAt = new Date().toISOString();
    }
    
    return comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

/**
 * Delete a comment by ID
 * @param commentId - ID of the comment to delete
 * @returns Promise with the delete response
 */
export const deleteComment = async (
  commentId: string
): Promise<DeleteCommentResponse> => {
  try {
    const response = await api.delete<DeleteCommentResponse>(
      `/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
