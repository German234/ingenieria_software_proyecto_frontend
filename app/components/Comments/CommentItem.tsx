"use client";

import { Comment } from "@/app/types/types";
import { formatRelativeTime } from "@/utils/formatRelativeTime";
import { Trash2 } from "lucide-react";
import Image from "next/image";

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
  currentUserId?: string;
}

export default function CommentItem({
  comment,
  onDelete,
  currentUserId,
}: CommentItemProps) {
  // Comparar por email ya que userId no viene en la respuesta
  const isOwner = currentUserId ? comment.userEmail === currentUserId : false;
  
  const userName = comment.userName || "Usuario desconocido";
  const userImage = comment.userProfilePicture;
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="group flex gap-3 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 hover:from-blue-50 hover:to-blue-100/30 transition-all duration-200 border border-gray-200/50 hover:border-blue-200 hover:shadow-sm">
      {/* User Avatar */}
      <div className="shrink-0">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-white shadow-md">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-base">
              {userInitial}
            </div>
          )}
        </div>
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900 text-sm">
              {userName}
            </h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200/70 text-xs text-gray-600 font-medium">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          {/* Delete Button */}
          {isOwner && onDelete && (
            <button
              onClick={() => onDelete(comment.id)}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium"
              title="Eliminar comentario"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          )}
        </div>

        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {comment.message}
        </p>
      </div>
    </div>
  );
}
