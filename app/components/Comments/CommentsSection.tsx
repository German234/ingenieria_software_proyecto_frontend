"use client";

import { useEffect, useState, useCallback } from "react";
import { Comment } from "@/app/types/types";
import {
  createComment,
  deleteComment,
  getCommentsBySupportMaterial,
} from "@/app/services/comments.service";
import CommentItem from "./CommentItem";
import { MessageSquare, Send, Loader2, ChevronDown } from "lucide-react";
import { toast } from "@pheralb/toast";
import axios from "axios";

interface CommentsSectionProps {
  supportMaterialId: string;
}

export default function CommentsSection({
  supportMaterialId,
}: CommentsSectionProps) {
  // TODO: Replace with your own authentication context
  const session = null as { user?: { info?: { nombreCompleto?: string; email?: string } } } | null; // Placeholder - replace with your auth context
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5); // Mostrar 5 inicialmente

  // Fetch comments on mount
  const loadComments = useCallback(async () => {
    if (!supportMaterialId) {
      console.warn("No supportMaterialId provided, skipping comments load");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getCommentsBySupportMaterial(supportMaterialId);
      setComments(data);
    } catch (error: unknown) {
      // Solo mostrar error si no es 404 (404 significa que no hay comentarios aún)
      if (axios.isAxiosError(error)) {
        console.error("Error loading comments:", error);
        toast.error({ 
          text: "Error al cargar los comentarios",
          description: "No se pudieron cargar los comentarios. Intenta nuevamente." 
        });
      }
    } finally {
      setLoading(false);
    }
  }, [supportMaterialId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error({ 
        text: "El comentario no puede estar vacío" 
      });
      return;
    }

    if (!session?.user) {
      toast.error({ 
        text: "Debes iniciar sesión para comentar" 
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const createdComment = await createComment({
        message: newComment.trim(),
        supportMaterialId,
      });

      // Asegurar que tenga un createdAt válido
      const commentWithDate = {
        ...createdComment,
        createdAt: createdComment.createdAt || new Date().toISOString()
      };

      setComments([commentWithDate, ...comments]);
      setNewComment("");
      toast.success({ 
        text: "Comentario agregado exitosamente" 
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error({ 
        text: "Error al crear el comentario",
        description: "No se pudo crear el comentario. Intenta nuevamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      return;
    }

    try {
      setIsDeleting(commentId);
      await deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success({ 
        text: "Comentario eliminado exitosamente" 
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error({ 
        text: "Error al eliminar el comentario",
        description: "No se pudo eliminar el comentario. Intenta nuevamente."
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
          <MessageSquare className="text-white" size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Comentarios
          </h2>
          {!loading && (
            <p className="text-sm text-gray-500">
              {comments.length} {comments.length === 1 ? 'comentario' : 'comentarios'}
            </p>
          )}
        </div>
      </div>

      {/* Comment Form */}
      {session?.user && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Comparte tu opinión..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[110px] text-gray-900 placeholder-gray-400 transition-all bg-white"
                disabled={isSubmitting}
              />
              <div className="absolute bottom-3 left-3 text-xs text-gray-400">
                {newComment.length} caracteres
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {session?.user?.info?.nombreCompleto || 'Usuario'}
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Publicar
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="animate-spin text-blue-600 mb-3" size={40} />
            <p className="text-sm text-gray-500">Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <MessageSquare
                className="text-gray-400"
                size={48}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No hay comentarios aún
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              ¡Sé el primero en compartir tu opinión sobre este contenido!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {comments.slice(0, visibleCount).map((comment) => (
                <div
                  key={comment.id}
                  className={isDeleting === comment.id ? "opacity-50 pointer-events-none" : ""}
                >
                  <CommentItem
                    comment={comment}
                    onDelete={handleDelete}
                    currentUserId={session?.user?.info?.email}
                  />
                </div>
              ))}
            </div>
            
            {/* Botón "Cargar más" */}
            {comments.length > visibleCount && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="group flex items-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl transition-all font-semibold text-sm border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                >
                  <ChevronDown size={20} className="group-hover:animate-bounce" />
                  Mostrar más ({comments.length - visibleCount} {comments.length - visibleCount === 1 ? 'comentario' : 'comentarios'})
                </button>
              </div>
            )}
            
            {/* Mostrar mensaje cuando se ven todos */}
            {visibleCount >= comments.length && comments.length > 5 && (
              <div className="text-center pt-6 pb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-green-700 font-medium">
                    Has visto todos los comentarios
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
