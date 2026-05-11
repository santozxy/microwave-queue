import {
  getTodayIsoDate,
  type TrashWeekSnapshot,
} from "./types";

interface TrashRotationResponse {
  assignment?: {
    assignee: string;
    date: string;
  };
  message?: string;
  removedAssignment?: {
    assignee: string;
    date: string;
  };
  snapshot?: TrashWeekSnapshot;
}

async function readJsonResponse<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("O servidor retornou uma resposta inválida.");
  }

  return (await response.json()) as T;
}

export async function fetchTrashWeekSnapshot(selectedDate: string) {
  const response = await fetch(`/api/trash-rotation?date=${selectedDate}`, {
    cache: "no-store",
  });
  const data = await readJsonResponse<TrashWeekSnapshot & { message?: string }>(
    response,
  );

  if (!response.ok) {
    throw new Error(data.message ?? "Não foi possível carregar os registros.");
  }

  return data;
}

export async function createTrashAssignmentRequest(
  selectedDate: string,
  participants: string[],
  assignee?: string,
) {
  const response = await fetch("/api/trash-rotation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assignee,
      date: selectedDate,
      participants,
    }),
  });
  const data = await readJsonResponse<TrashRotationResponse>(response);

  if (!response.ok) {
    throw new Error(data.message ?? "Não foi possível salvar o rodízio.");
  }

  return data;
}

export async function removeTrashAssignmentRequest(selectedDate: string) {
  const response = await fetch(`/api/trash-rotation?date=${selectedDate}`, {
    method: "DELETE",
  });
  const data = await readJsonResponse<TrashRotationResponse>(response);

  if (!response.ok) {
    throw new Error(data.message ?? "Não foi possível remover o rodízio.");
  }

  return data;
}

export { getTodayIsoDate };
