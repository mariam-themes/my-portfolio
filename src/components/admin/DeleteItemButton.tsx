'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteItemButtonProps {
  itemId: string;
  endpoint: string;
  confirmText: string;
  successText: string;
  failedText: string;
  deleteText: string;
}

export default function DeleteItemButton({
  itemId,
  endpoint,
  confirmText,
  successText,
  failedText,
  deleteText,
}: DeleteItemButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(confirmText)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${endpoint}/${itemId}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || failedText);
      }

      toast.success(successText);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5 rtl:mr-0 rtl:ml-1.5" />}
      {deleteText}
    </button>
  );
}
