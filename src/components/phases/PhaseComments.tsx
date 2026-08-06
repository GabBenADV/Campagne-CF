import { useEffect, useState } from "react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { campaignsApi } from "../../services/campaignsApi";
import type { PhaseComment } from "../../types/types";

type PhaseCommentsProps = {
  clientPhaseId: number;
  canViewComments?: boolean;
  canAddComment?: boolean;
};

export default function PhaseComments({
  clientPhaseId,
  canViewComments = true,
  canAddComment = false,
}: PhaseCommentsProps) {
  const [comments, setComments] = useState<PhaseComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    if (!clientPhaseId || !canViewComments) {
      setComments([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await campaignsApi<PhaseComment[]>("getPhaseComments", {
        client_phase_id: clientPhaseId,
      });

      setComments(Array.isArray(data) ? data : []);

      // console.log("COMMENTS DEBUG", {
      //   clientPhaseId,
      //   canViewComments,
      //   canAddComment,
      //   comments: data,
      // });

      console.table(
        data.map((comment) => ({
          id: comment.id,
          phase_position: comment.phase_position,
          phase_title: comment.phase_title,
          author: comment.author,
          text: comment.text,
        }))
      );
    } catch (error) {
      console.error("Errore caricamento commenti fase:", error);
      setError("Non è stato possibile caricare i commenti.");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitComment = async (
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>
  ) => {
    event.preventDefault();

    if (!canAddComment || isSaving) {
      return;
    }

    const trimmedComment = newComment.trim();

    if (!trimmedComment) {
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await campaignsApi("addPhaseComment", {
        client_phase_id: clientPhaseId,
        comment: trimmedComment,
      });

      setNewComment("");
      await fetchComments();
    } catch (error) {
      console.error("Errore salvataggio commento fase:", error);

      const message =
        error instanceof Error && error.message
          ? error.message
          : "Non è stato possibile salvare il commento.";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [clientPhaseId, canViewComments]);

  if (!canViewComments) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-300 bg-white p-4">
      
      <div className="flex gap-2 items-center">
        <ChatBubbleLeftRightIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
        <h3 className="mb-4 text-lg font-bold uppercase">Commenti</h3>
      </div>

      {canAddComment ? (
        <form onSubmit={submitComment} className="mb-4 space-y-3">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-gray-500"
            placeholder="Scrivi un commento..."
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving || !newComment.trim()}
              className="rounded-lg! bg-gray-500! px-4 py-2 text-sm! font-semibold text-white transition hover:bg-gray-700! disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Salvataggio..." : "Aggiungi commento"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-4 text-sm text-gray-500">
          Puoi visualizzare i commenti disponibili, ma non puoi commentare
          questa fase.
        </p>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-gray-500">Caricamento commenti...</p>
      )}

      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-gray-500">
          Nessun commento disponibile per la tua posizione.
        </p>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => {
            const commentText = comment.comment || comment.text || "";
            const phaseLabel =
              comment.phase_position || comment.phase_title
                ? `Fase ${comment.phase_position }`
                : null;

            return (
              <div
                key={comment.id}
                className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div className="h-16 overflow-hidden rounded-lg">
                  {comment.author_image ? (
                    <img
                      src={comment.author_image}
                      alt={comment.author || "Avatar utente"}
                      className="h-full w-auto object-cover"
                    />
                  ) : (
                    <div className="bg-gray-300 text-gray-600 w-full h-full flex items-center justify-center font-semibold">
                      {comment.author?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {phaseLabel && (
                    <div className="mb-2 w-fit rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-600">
                      {phaseLabel}
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {commentText}
                  </p>

                  {(comment.author || comment.created_at) && (
                    <p className="mt-2 text-xs text-gray-400">
                      {comment.author}
                      {comment.author && comment.created_at ? " · " : ""}
                      {comment.created_at}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}