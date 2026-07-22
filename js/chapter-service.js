import { getSupabase } from "./supabase-client.js";
import { validateChapterMarks } from "./validators.js";

function throwIfError(error) {
  if (error) throw error;
}

export async function getChapterMarks(volumeId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("chapter_marks")
    .select("*")
    .eq("volume_id", volumeId)
    .order("chapter", { ascending: true });
  throwIfError(error);
  return data || [];
}

export async function replaceChapterMarks(volumeId, marks) {
  const validated = validateChapterMarks(marks);
  const { error } = await getSupabase().rpc("replace_chapter_marks", {
    p_volume_id: volumeId,
    p_marks: validated
  });
  throwIfError(error);
}

export async function deleteChapterMarks(volumeId) {
  const { error } = await getSupabase()
    .from("chapter_marks")
    .delete()
    .eq("volume_id", volumeId);
  throwIfError(error);
}
